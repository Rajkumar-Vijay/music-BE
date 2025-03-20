import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // The item that was liked (song or playlist)
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // Type of the item (song or playlist)
  itemType: {
    type: String,
    enum: ["song", "playlist"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only like an item once
likeSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;