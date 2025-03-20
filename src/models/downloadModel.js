
import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song",
    required: true
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  }
});

const Download = mongoose.model("Download", downloadSchema);

export default Download;