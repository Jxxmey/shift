
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true, unique: true },
    displayName: String,
    notifyEnabled: { type: Boolean, default: true },
    tz: { type: String, default: 'Asia/Bangkok' },
    currentTeam: { type: String, default: 'default' },
    currentBranch: { type: String, default: 'main' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
