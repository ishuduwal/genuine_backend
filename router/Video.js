import express from "express";
import {
  getVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
} from "../controller/Video.js";

const videoRouter = express.Router();

videoRouter.get("/", getVideo);
videoRouter.post("/", uploadVideo);
videoRouter.put("/:id", updateVideo);
videoRouter.delete("/:id", deleteVideo);

export default videoRouter;