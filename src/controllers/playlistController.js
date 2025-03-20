import Playlist from "../models/playlistModel.js";
import Song from "../models/songModel.js";
import { v2 as cloudinary } from "cloudinary";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user._id;

    // Create playlist with default values
    const playlist = await Playlist.create({
      name,
      description,
      user: userId,
      isPublic: isPublic !== undefined ? isPublic : true,
      songs: [],
    });

    // If there's a cover image, upload it to cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "music_app/playlists",
      });

      // Update playlist with cover image
      playlist.coverImage = result.secure_url;
      await playlist.save();
    }

    res.status(201).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create playlist",
      error: error.message,
    });
  }
};

// Get all playlists for a user
export const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;

    const playlists = await Playlist.find({ user: userId })
      .populate({
        path: "songs",
        select: "name image duration artist",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists,
    });
  } catch (error) {
    console.error("Error getting user playlists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get playlists",
      error: error.message,
    });
  }
};

// Get a single playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(id)
      .populate({
        path: "songs",
        select: "name image duration file artist album desc genre",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if the playlist is private and not owned by the requesting user
    if (
      !playlist.isPublic &&
      playlist.user._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this playlist",
      });
    }

    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    console.error("Error getting playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get playlist",
      error: error.message,
    });
  }
};

// Update a playlist
export const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.user._id;

    let playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if the user owns the playlist
    if (playlist.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this playlist",
      });
    }

    // Update fields
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    // If there's a new cover image, upload it to cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "music_app/playlists",
      });

      playlist.coverImage = result.secure_url;
    }

    await playlist.save();

    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update playlist",
      error: error.message,
    });
  }
};

// Delete a playlist
export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if the user owns the playlist
    if (playlist.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this playlist",
      });
    }

    await playlist.deleteOne();

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete playlist",
      error: error.message,
    });
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const userId = req.user._id;

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if the user owns the playlist
    if (playlist.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this playlist",
      });
    }

    // Find the song
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check if the song is already in the playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song is already in the playlist",
      });
    }

    // Add the song to the playlist
    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Song added to playlist successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add song to playlist",
      error: error.message,
    });
  }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const userId = req.user._id;

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if the user owns the playlist
    if (playlist.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this playlist",
      });
    }

    // Check if the song is in the playlist
    if (!playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song is not in the playlist",
      });
    }

    // Remove the song from the playlist
    playlist.songs = playlist.songs.filter(
      (song) => song.toString() !== songId
    );
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Song removed from playlist successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove song from playlist",
      error: error.message,
    });
  }
};

// Get public playlists
export const getPublicPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true })
      .populate({
        path: "songs",
        select: "name image duration artist",
      })
      .populate({
        path: "user",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists,
    });
  } catch (error) {
    console.error("Error getting public playlists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public playlists",
      error: error.message,
    });
  }
};
