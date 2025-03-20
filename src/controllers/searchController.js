import Song from "../models/songModel.js";
import Album from "../models/albumModel.js";
import Playlist from "../models/playlistModel.js";

// Search for songs, albums, and playlists
export const search = async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    let results = {};

    // If type is specified, only search that type
    if (type) {
      switch (type.toLowerCase()) {
        case "song":
          results.songs = await searchSongs(query);
          break;
        case "album":
          results.albums = await searchAlbums(query);
          break;
        case "playlist":
          results.playlists = await searchPlaylists(query, req.user?._id);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid search type. Must be 'song', 'album', or 'playlist'"
          });
      }
    } else {
      // Search all types
      results.songs = await searchSongs(query);
      results.albums = await searchAlbums(query);
      results.playlists = await searchPlaylists(query, req.user?._id);
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search",
      error: error.message
    });
  }
};

// Search for songs
const searchSongs = async (query) => {
  // Search by text index
  const textSearchResults = await Song.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20);

  // If text search returns results, return them
  if (textSearchResults.length > 0) {
    return textSearchResults;
  }

  // Otherwise, do a regex search
  return await Song.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { desc: { $regex: query, $options: "i" } },
      { album: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } }
    ]
  }).limit(20);
};

// Search for albums
const searchAlbums = async (query) => {
  // Search by text index
  const textSearchResults = await Album.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20);

  // If text search returns results, return them
  if (textSearchResults.length > 0) {
    return textSearchResults;
  }

  // Otherwise, do a regex search
  return await Album.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { desc: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } }
    ]
  }).limit(20);
};

// Search for playlists
const searchPlaylists = async (query, userId) => {
  // If user is logged in, include their private playlists in the search
  const visibilityFilter = userId
    ? {
        $or: [
          { isPublic: true },
          { user: userId }
        ]
      }
    : { isPublic: true };

  // Search by text index
  const textSearchResults = await Playlist.find(
    {
      $text: { $search: query },
      ...visibilityFilter
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .populate({
      path: "user",
      select: "name"
    })
    .limit(20);

  // If text search returns results, return them
  if (textSearchResults.length > 0) {
    return textSearchResults;
  }

  // Otherwise, do a regex search
  return await Playlist.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ],
    ...visibilityFilter
  })
    .populate({
      path: "user",
      select: "name"
    })
    .limit(20);
};