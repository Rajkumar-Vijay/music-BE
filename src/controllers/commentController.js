import Comment from "../models/commentModel.js";
import Song from "../models/songModel.js";
import Playlist from "../models/playlistModel.js";

// Add a comment to a song or playlist
export const addComment = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const { content } = req.body;
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

    // Create a new comment
    const comment = await Comment.create({
      content,
      user: userId,
      itemId,
      itemType
    });

    // Update the comments count on the item
    if (itemType === "song") {
      await Song.findByIdAndUpdate(itemId, { $inc: { commentsCount: 1 } });
    } else {
      await Playlist.findByIdAndUpdate(itemId, { $inc: { commentsCount: 1 } });
    }

    // Populate user details
    await comment.populate({
      path: "user",
      select: "name email"
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment
    });
  } catch (error) {
    console.error(`Error adding comment to ${req.params.itemType}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if the user owns the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this comment"
      });
    }

    // Delete the comment
    await comment.deleteOne();

    // Update the comments count on the item
    if (comment.itemType === "song") {
      await Song.findByIdAndUpdate(comment.itemId, { $inc: { commentsCount: -1 } });
    } else {
      await Playlist.findByIdAndUpdate(comment.itemId, { $inc: { commentsCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message
    });
  }
};

// Get comments for a song or playlist
export const getItemComments = async (req, res) => {
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

    // Get the comments for the item
    const comments = await Comment.find({ itemId, itemType })
      .populate({
        path: "user",
        select: "name email"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error(`Error getting comments for ${req.params.itemType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get comments for ${req.params.itemType}`,
      error: error.message
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if the user owns the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this comment"
      });
    }

    // Update the comment
    comment.content = content;
    await comment.save();

    // Populate user details
    await comment.populate({
      path: "user",
      select: "name email"
    });

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message
    });
  }
};