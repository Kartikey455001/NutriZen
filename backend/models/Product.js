import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  productName: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  category: {
    type: String,
  },
  ingredientsText: {
    type: String,
  },
  nutrition: {
    calories: String,
    protein: String,
    carbohydrates: String,
    sugar: String,
    fat: String,
    saturatedFat: String,
    fiber: String,
    sodium: String,
    salt: String,
  },
  imageFrontUrl: {
    type: String,
  },
  servingSize: {
    type: String,
  },
  quantity: {
    type: String,
  },
  country: {
    type: String,
  },
  source: {
    type: String,
    default: 'OpenFoodFacts',
  },
  aiAnalysis: {
    type: Object, // We cache the Gemini AI analysis here to save API calls
  }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;
