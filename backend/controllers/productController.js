import axios from 'axios';
import { analyzeProductWithGemini } from '../utils/geminiHelper.js';

export const getProductDetails = async (req, res) => {
  const { barcode } = req.params;

  try {
    // 1. Fetch from OpenFoodFacts
    const offResponse = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (offResponse.data.status !== 1) {
      return res.status(404).json({ message: 'Product not found in public database' });
    }

    const product = offResponse.data.product;

    // 2. Perform AI Analysis with Gemini
    const aiAnalysis = await analyzeProductWithGemini(product);

    // 3. Combine and return
    res.json({
      barcode,
      basicInfo: {
        productName: product.product_name,
        brand: product.brands,
        imageFrontUrl: product.image_front_url,
        ingredientsText: product.ingredients_text,
        nutriments: product.nutriments,
      },
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing product analysis' });
  }
};
