import mongoose from "mongoose";

const diaryEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  meals: {
    breakfast: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    lunch: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    dinner: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  water: {
    type: Number,
    default: 0,
    min: 0,
    max: 8
  }
}, 
  {timestamps: true}
);

diaryEntrySchema.index({ user: 1, date: 1 }, { unique: true });

const DiaryEntry = mongoose.model("DiaryEntry", diaryEntrySchema);

export default DiaryEntry;