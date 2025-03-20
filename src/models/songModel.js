import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
    unique: true,
  },
  album: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    default: "Unknown Artist"
  },
  genre: {
    type: String,
    default: "Other"
  },
  releaseYear: {
    type: Number
  },
  image: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  downloadable: {
    type: Boolean,
    default: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  downloadsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for populating related data
songSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'itemId',
  match: { itemType: 'song' }
});

songSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'itemId',
  match: { itemType: 'song' }
});

// Create text index for search functionality
songSchema.index({
  name: 'text',
  desc: 'text',
  album: 'text',
  artist: 'text',
  genre: 'text'
});

const songModel = mongoose.models.song || mongoose.model("song", songSchema);
export default songModel;
