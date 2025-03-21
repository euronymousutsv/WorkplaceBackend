import express from "express";
import {
  createNewChannel,
  deleteChannel,
  getAllChannelForCurrentServer,
} from "../../controllers/server/channelController.js";

const router = express.Router();
router.post("/create", createNewChannel);
router.get("/getAllChannelForCurrentServer/", getAllChannelForCurrentServer);
router.delete("/delete", deleteChannel);
export default router;
