import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  bgColor: {type: String, required: true},
  image: {type: String, required: true},
  artist: {type: String, default: "Various Artists"},
  releaseYear: {type: Number},
  genre: {type: String, default: "Other"},
  likesCount: {type: Number, default: 0},
  commentsCount: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for populating related data
albumSchema.virtual('songs', {
  ref: 'song',
  localField: 'name',
  foreignField: 'album'
});

albumSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'itemId',
  match: { itemType: 'album' }
});

albumSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'itemId',
  match: { itemType: 'album' }
});

// Create text index for search functionality
albumSchema.index({
  name: 'text',
  desc: 'text',
  artist: 'text',
  genre: 'text'
});

const albumModel = mongoose.models.album || mongoose.model("album", albumSchema);
export default albumModel
