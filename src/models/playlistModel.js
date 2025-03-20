import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Playlist name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    default:
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
