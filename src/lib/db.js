
import mongoose from 'mongoose';

export async function initMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shiba_shift';
  await mongoose.connect(uri, { dbName: 'shiba_shift' });
  console.log('[Shiba] Mongo connected');
}
