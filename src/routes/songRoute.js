import { addSong, listSong, removeSong, getSongById } from "../controllers/songController.js";
import express from "express";
const songRouter = express.Router();
import upload from "../middleware/multer.js";

songRouter.post(
  "/add",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  addSong
);
songRouter.get("/list", listSong);
songRouter.get("/:id", getSongById);
songRouter.post("/remove/:id", removeSong);

// Error handling middleware
songRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});


export default songRouter;
