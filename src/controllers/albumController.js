import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";
const addAlbum = async (req, res) => {
  try {
    console.log("Add album request received:", req.body);
    console.log("File received:", req.file);

    const name = req.body.name;
    const desc = req.body.desc;
    const bgColor = req.body.bgColor;

    if (!req.file) {
      console.error("No image file found in request");
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const imageFile = req.file;

    console.log("Uploading image to cloudinary:", imageFile.path);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    console.log("Cloudinary upload successful:", imageUpload.secure_url);

    const albumData = {
      name,
      desc,
      bgColor,
      image: imageUpload.secure_url,
    };

    console.log("Creating album with data:", albumData);
    const album = albumModel(albumData);
    await album.save();
    console.log("Album saved successfully");

    res.json({ success: true, message: "Album added" });
  } catch (error) {
    console.error("Error in addAlbum:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const listAlbum = async (req, res) => {
  try {
    const albums = await albumModel.find();
    res.json({ success: true, albums: albums }); // Changed allAlbums to albums
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const removeAlbum = async (req, res) => {
  try {
    console.log("Remove album request received for ID:", req.params.id);

    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Album ID is required" });
    }

    const album = await albumModel.findByIdAndDelete(id);

    if (!album) {
      return res.status(404).json({ success: false, message: "Album not found" });
    }

    console.log("Album removed successfully:", id);
    res.json({ success: true, message: "Album removed successfully" });
  } catch (error) {
    console.error("Error in removeAlbum:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export { addAlbum, listAlbum, removeAlbum };
