import Like from "../models/likeModel.js";
import Song from "../models/songModel.js";
import Playlist from "../models/playlistModel.js";
import mongoose from "mongoose";

// Like a song or playlist
export const likeItem = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const userId = req.user._id;

    // Validate item type
    if (!["song", "playlist"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'song' or 'playlist'"
      });
    }

    // Check if the item exists
    let item;
    if (itemType === "song") {
      item = await Song.findById(itemId);
    } else {
      item = await Playlist.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} not found`
      });
    }

    // Check if the user has already liked the item
    const existingLike = await Like.findOne({
      user: userId,
      itemId,
      itemType
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: `You have already liked this ${itemType}`
      });
    }

    // Create a new like
    const like = await Like.create({
      user: userId,
      itemId,
      itemType
    });

    // Update the likes count on the item
    if (itemType === "song") {
      await Song.findByIdAndUpdate(itemId, { $inc: { likesCount: 1 } });
    } else {
      await Playlist.findByIdAndUpdate(itemId, { $inc: { likesCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} liked successfully`,
      data: like
    });
  } catch (error) {
    console.error(`Error liking ${req.params.itemType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to like ${req.params.itemType}`,
      error: error.message
    });
  }
};

// Unlike a song or playlist
export const unlikeItem = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const userId = req.user._id;

    // Validate item type
    if (!["song", "playlist"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'song' or 'playlist'"
      });
    }

    // Find the like
    const like = await Like.findOne({
      user: userId,
      itemId,
      itemType
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: `You have not liked this ${itemType}`
      });
    }

    // Delete the like
    await like.deleteOne();

    // Update the likes count on the item
    if (itemType === "song") {
      await Song.findByIdAndUpdate(itemId, { $inc: { likesCount: -1 } });
    } else {
      await Playlist.findByIdAndUpdate(itemId, { $inc: { likesCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} unliked successfully`
    });
  } catch (error) {
    console.error(`Error unliking ${req.params.itemType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to unlike ${req.params.itemType}`,
      error: error.message
    });
  }
};

// Get likes for a song or playlist
export const getItemLikes = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;

    // Validate item type
    if (!["song", "playlist"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'song' or 'playlist'"
      });
    }

    // Check if the item exists
    let item;
    if (itemType === "song") {
      item = await Song.findById(itemId);
    } else {
      item = await Playlist.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} not found`
      });
    }

    // Get the likes for the item
    const likes = await Like.find({ itemId, itemType })
      .populate({
        path: "user",
        select: "name email"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    console.error(`Error getting likes for ${req.params.itemType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get likes for ${req.params.itemType}`,
      error: error.message
    });
  }
};

// Check if a user has liked an item
export const checkUserLike = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const userId = req.user._id;

    // Validate item type
    if (!["song", "playlist"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'song' or 'playlist'"
      });
    }

    // Check if the user has liked the item
    const like = await Like.findOne({
      user: userId,
      itemId,
      itemType
    });

    res.status(200).json({
      success: true,
      liked: !!like
    });
  } catch (error) {
    console.error(`Error checking like for ${req.params.itemType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to check like for ${req.params.itemType}`,
      error: error.message
    });
  }
};

// Get user's liked songs
export const getUserLikedSongs = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the user's liked songs
    const likes = await Like.find({ user: userId, itemType: "song" })
      .sort({ createdAt: -1 });

    // Get the song details
    const songIds = likes.map(like => like.itemId);
    const songs = await Song.find({ _id: { $in: songIds } });

    res.status(200).json({
      success: true,
      count: songs.length,
      data: songs
    });
  } catch (error) {
    console.error("Error getting user's liked songs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get liked songs",
      error: error.message
    });
  }
};

// Get user's liked playlists
export const getUserLikedPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the user's liked playlists
    const likes = await Like.find({ user: userId, itemType: "playlist" })
      .sort({ createdAt: -1 });

    // Get the playlist details
    const playlistIds = likes.map(like => like.itemId);
    const playlists = await Playlist.find({ _id: { $in: playlistIds } })
      .populate({
        path: "songs",
        select: "name image duration artist"
      })
      .populate({
        path: "user",
        select: "name email"
      });

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (error) {
    console.error("Error getting user's liked playlists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get liked playlists",
      error: error.message
    });
  }
};