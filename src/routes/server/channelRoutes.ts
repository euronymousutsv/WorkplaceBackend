import express from "express";
import {
  addAccessToChannel,
  changeAChannelName,
  createNewChannel,
  deleteChannel,
  getAllChannelForCurrentServer,
  getChannelDetails,
} from "../../controllers/server/channelController";
import { verifyLoginStatus } from "../../utils/jwtGenerater";

const router = express.Router();
router.post("/create", verifyLoginStatus, createNewChannel);
router.get(
  "/getAllChannelForCurrentServer/",
  verifyLoginStatus,
  getAllChannelForCurrentServer
);
router.delete("/delete", verifyLoginStatus, deleteChannel);
router.post("/addAccessToChannel", verifyLoginStatus, addAccessToChannel);
router.put("/changeAChannelName", verifyLoginStatus, changeAChannelName);
router.get("/getChannelDetails", verifyLoginStatus, getChannelDetails);

export default router;
