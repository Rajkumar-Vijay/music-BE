import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";

// Get a single song by ID
const getSongById = async (req, res) => {
  try {
    const id = req.params.id;
    const song = await songModel.findById(id);

    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addSong = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const album = req.body.album;
    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const duration = `${Math.floor(audioUpload.duration / 60)}: ${Math.floor(
      audioUpload.duration % 60
    )}`;
    console.log(name, desc, album, audioUpload, imageUpload);

    const songData = {
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration,
    };
    const song = songModel(songData);
    await song.save();
    res.json({ success: true, message: "Song added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const listSong = async (req, res) => {
  try {
    const allSongs = await songModel.find();
    res.json({ success: true, songs: allSongs });
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
};
const removeSong = async (req, res) => {
  try {
    const id = req.params.id;
    const song = await songModel.findByIdAndDelete(id);

    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    res.json({ success: true, message: "Song deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export { addSong, listSong, removeSong, getSongById };
