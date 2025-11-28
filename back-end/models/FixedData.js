import mongoose from 'mongoose';

const FixedDataSchema = new mongoose.Schema({
  generalNames: [{ type: String }],
  categories: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('FixedData', FixedDataSchema);
