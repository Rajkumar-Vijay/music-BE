import Download from "../models/downloadModel.js";
import Song from "../models/songModel.js";
import fs from "fs";
import path from "path";

// Download a song
export const downloadSong = async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user._id;

    // Find the song
    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found"
      });
    }

    // Check if the song is downloadable
    if (!song.downloadable) {
      return res.status(403).json({
        success: false,
        message: "This song is not available for download"
      });
    }

    // Record the download
    await Download.create({
      user: userId,
      song: songId
    });

    // Update the downloads count
    await Song.findByIdAndUpdate(songId, { $inc: { downloadsCount: 1 } });

    // Return the download URL
    res.status(200).json({
      success: true,
      message: "Song download initiated",
      downloadUrl: song.file
    });
  } catch (error) {
    console.error("Error downloading song:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download song",
      error: error.message
    });
  }
};

// Get user's download history
export const getUserDownloads = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the user's downloads
    const downloads = await Download.find({ user: userId })
      .populate({
        path: "song",
        select: "name image duration artist album"
      })
      .sort({ downloadedAt: -1 });

    res.status(200).json({
      success: true,
      count: downloads.length,
      data: downloads
    });
  } catch (error) {
    console.error("Error getting user's downloads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get downloads",
      error: error.message
    });
  }
};