
import mongoose from 'mongoose';

const DaySchema = new mongoose.Schema(
  { day: Number, code: String },
  { _id: false }
);

const ScheduleSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    team: { type: String, default: 'default', index: true },
    branch: { type: String, default: 'main', index: true },
    month: Number,
    year: Number,
    days: [DaySchema],
    rawText: String,
  },
  { timestamps: true }
);

ScheduleSchema.index({ userId: 1, team: 1, branch: 1, month: 1, year: 1 }, { unique: true });

export const Schedule = mongoose.model('Schedule', ScheduleSchema);
