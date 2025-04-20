import express from "express";
import {
  addAccessToChannel,
  changeAChannelName,
  createNewChannel,
  deleteChannel,
  getAllChannelForCurrentOffice,
  getChannelDetails,
} from "../../controllers/server/channelController";
import { verifyLoginStatus } from "../../middleware/verifyLoginMiddleware";

const router = express.Router();
router.post("/create", verifyLoginStatus, createNewChannel);
router.get(
  "/getAllChannelForCurrentOffice/",
  verifyLoginStatus,
  getAllChannelForCurrentOffice
);
router.delete("/delete", verifyLoginStatus, deleteChannel);
router.post("/addAccessToChannel", verifyLoginStatus, addAccessToChannel);
router.put("/changeAChannelName", verifyLoginStatus, changeAChannelName);
router.get("/getChannelDetails", verifyLoginStatus, getChannelDetails);

export default router;
