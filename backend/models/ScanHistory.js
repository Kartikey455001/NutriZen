import mongoose from 'mongoose';

const ScanHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  barcode: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
  },
  brand: {
    type: String,
  },
  healthScore: {
    type: Number,
  },
  healthStatus: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

const ScanHistory = mongoose.model('ScanHistory', ScanHistorySchema);
export default ScanHistory;
