import axios from 'axios';
import Product from '../models/Product.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ProductSeederService {
  constructor() {
    this.categories = [
      'Biscuits', 'Breakfast cereals', 'Chocolates', 'Desserts',
      'Cold drinks', 'Juices', 'Snacks', 'Chips', 'Instant noodles',
      'Dairy', 'Breads', 'Sauces', 'Cooking oils', 'Teas', 'Coffees',
      'Baby foods', 'Frozen foods', 'Protein foods', 'Dried fruits', 'Ice creams'
    ];
    this.baseUrl = 'https://world.openfoodfacts.org/cgi/search.pl';
  }

  // Maps raw OFF product to our DB schema
  mapProductData(product, category) {
    if (!product.code || !product.product_name) return null; // Skip invalid

    return {
      barcode: product.code,
      productName: product.product_name,
      brand: product.brands || 'Unknown',
      category: category,
      ingredientsText: product.ingredients_text || '',
      nutrition: {
        calories: product.nutriments?.['energy-kcal_100g']?.toString() || '0',
        protein: product.nutriments?.proteins_100g?.toString() || '0',
        carbohydrates: product.nutriments?.carbohydrates_100g?.toString() || '0',
        sugar: product.nutriments?.sugars_100g?.toString() || '0',
        fat: product.nutriments?.fat_100g?.toString() || '0',
        saturatedFat: product.nutriments?.['saturated-fat_100g']?.toString() || '0',
        fiber: product.nutriments?.fiber_100g?.toString() || '0',
        sodium: product.nutriments?.sodium_100g?.toString() || '0',
        salt: product.nutriments?.salt_100g?.toString() || '0',
      },
      imageFrontUrl: product.image_front_url || '',
      servingSize: product.serving_size || '',
      quantity: product.quantity || '',
      country: product.countries || 'India',
      source: 'OpenFoodFacts Seeder',
    };
  }

  async fetchCategoryProducts(category, limit = 50, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(this.baseUrl, {
          params: {
            action: 'process',
            tagtype_0: 'categories',
            tag_contains_0: 'contains',
            tag_0: category,
            json: 1,
            page_size: limit,
            countries: 'India',
          }
        });
        return response.data.products || [];
      } catch (error) {
        if (i === retries - 1) {
          console.error(`❌ Failed to fetch category ${category} after ${retries} attempts:`, error.message);
          return [];
        }
        console.log(`⚠️ 503 or error for ${category}. Retrying in 3 seconds...`);
        await sleep(3000);
      }
    }
    return [];
  }

  async run(refresh = false, specificCategories = null) {
    console.log('🌱 Starting Database Seeding Process...');
    
    if (refresh) {
      console.log('🗑️ Refresh mode active: Deleting all existing products...');
      await Product.deleteMany({});
    }

    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    const categoriesToRun = specificCategories || this.categories;

    for (const category of categoriesToRun) {
      console.log(`\n📦 Fetching top products for: ${category}`);
      const rawProducts = await this.fetchCategoryProducts(category, 50);
      
      let categoryImported = 0;
      let categorySkipped = 0;

      for (const raw of rawProducts) {
        const mappedData = this.mapProductData(raw, category);
        
        if (!mappedData) {
          totalFailed++;
          continue;
        }

        try {
          // Check if exists
          const exists = await Product.findOne({ barcode: mappedData.barcode });
          if (exists) {
            categorySkipped++;
            totalSkipped++;
            continue;
          }

          // Insert
          await Product.create(mappedData);
          categoryImported++;
          totalImported++;
        } catch (error) {
          console.error(`⚠️ Error inserting barcode ${mappedData.barcode}:`, error.message);
          totalFailed++;
        }
      }

      console.log(`✅ [${category}] Imported: ${categoryImported} | Skipped: ${categorySkipped}`);
      
      // Wait to avoid rate limiting on next loop
      if (categoriesToRun.length > 1) {
        await sleep(2000);
      }
    }

    console.log('\n=======================================');
    console.log('🏁 SEEDING COMPLETE');
    console.log(`Total Imported : ${totalImported}`);
    console.log(`Total Skipped  : ${totalSkipped}`);
    console.log(`Total Failed   : ${totalFailed}`);
    console.log('=======================================\n');
  }
}

export default new ProductSeederService();
