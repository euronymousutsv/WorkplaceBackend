import express from "express";
import {
  deleteMessage,
  getChatsByChannel,
  sendMessage,
  updateMessage,
} from "../../controllers/server/chatController";
import { verifyLoginStatus } from "../../utils/jwtGenerater";

const router = express.Router();
router.post("/send", verifyLoginStatus, sendMessage);
router.put("/update", verifyLoginStatus, updateMessage);
router.delete("/delete", verifyLoginStatus, deleteMessage);
router.get("/fetchChats/:channelId", verifyLoginStatus, getChatsByChannel);

export default router;
