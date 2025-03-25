import express from "express";
import {
  addAccessToChannel,
  changeAChannelName,
  createNewChannel,
  deleteChannel,
  getAllChannelForCurrentServer,
  getChannelDetails,
} from "../../controllers/server/channelController";

const router = express.Router();
router.post("/create", createNewChannel);
router.get("/getAllChannelForCurrentServer/", getAllChannelForCurrentServer);
router.delete("/delete", deleteChannel);
router.post("/addAccessToChannel", addAccessToChannel);
router.put("/changeAChannelName", changeAChannelName);
router.get("/getChannelDetails", getChannelDetails);

export default router;
