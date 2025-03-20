
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Comment content is required"],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // The item that was commented on (song or playlist)
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

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;