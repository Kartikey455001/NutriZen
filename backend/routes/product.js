import express from 'express';
import axios from 'axios';
import Product from '../models/Product.js';
import { analyzeProductWithGemini } from '../utils/geminiHelper.js';
import seederService from '../services/ProductSeederService.js';

const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    // Get 6 random products that have an image and AI analysis
    const trendingProducts = await Product.aggregate([
      { $match: { imageFrontUrl: { $ne: '' } } },
      { $sample: { size: 6 } }
    ]);
    res.json(trendingProducts);
  } catch (error) {
    console.error('Error fetching trending products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    // Case-insensitive search on product name or brand
    const regex = new RegExp(q, 'i');
    const results = await Product.find({
      $or: [
        { productName: regex },
        { brand: regex },
        { barcode: regex }
      ]
    }).limit(10).select('barcode productName brand imageFrontUrl category');
    
    res.json(results);
  } catch (error) {
    console.error('Error searching products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;

    // 1. Search MongoDB First (Instant Cache Hit)
    let product = await Product.findOne({ barcode });

    if (product) {
      console.log(`✅ Cache Hit: Found ${barcode} in database.`);
      
      // If we don't have the AI analysis cached, generate it and cache it.
      if (!product.aiAnalysis) {
        console.log(`🤖 Generating AI analysis for cached product ${barcode}...`);
        try {
          const aiAnalysis = await analyzeProductWithGemini({
            product_name: product.productName,
            brands: product.brand,
            ingredients_text: product.ingredientsText,
            nutriments: product.nutrition
          });
          product.aiAnalysis = aiAnalysis;
          await product.save();
        } catch (aiError) {
          console.error("AI Analysis failed for cached product:", aiError);
          // Fallback dummy data if AI fails
          product.aiAnalysis = {
            healthScore: 5,
            healthStatus: 'Neutral',
            summary: 'Could not generate AI insights at this time.',
          };
        }
      }

      return res.json({
        basicInfo: product,
        analysis: product.aiAnalysis
      });
    }

    // 2. Fallback: Fetch from OpenFoodFacts
    console.log(`🌐 Cache Miss: Fetching ${barcode} from OpenFoodFacts...`);
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const offResponse = await axios.get(offUrl);
    
    if (!offResponse.data || offResponse.data.status !== 1) {
      return res.status(404).json({ message: 'Product not found in public database.' });
    }

    const rawProduct = offResponse.data.product;

    // 3. Map to our schema format
    const mappedProduct = seederService.mapProductData(rawProduct, 'Uncategorized');
    if (!mappedProduct) {
      return res.status(400).json({ message: 'Product data was incomplete.' });
    }

    // 4. Generate AI Analysis for the new product
    console.log(`🤖 Generating AI analysis for newly fetched product ${barcode}...`);
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeProductWithGemini({
        product_name: mappedProduct.productName,
        brands: mappedProduct.brand,
        ingredients_text: mappedProduct.ingredientsText,
        nutriments: mappedProduct.nutrition
      });
    } catch (aiError) {
      console.error("AI Analysis failed for new product:", aiError);
      aiAnalysis = {
        healthScore: 5,
        healthStatus: 'Neutral',
        summary: 'Could not generate AI insights at this time.',
      };
    }
    
    mappedProduct.aiAnalysis = aiAnalysis;

    // 5. Cache the product permanently in MongoDB
    console.log(`💾 Caching ${barcode} into MongoDB permanently.`);
    const newProduct = await Product.create(mappedProduct);

    return res.json({
      basicInfo: newProduct,
      analysis: newProduct.aiAnalysis
    });

  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Server error processing product lookup.' });
  }
});

export default router;
