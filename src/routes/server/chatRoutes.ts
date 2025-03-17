import express from "express";
import {
  deleteMessage,
  getChatsByChannel,
  sendMessage,
  updateMessage,
} from "../../controllers/server/chatController";

const router = express.Router();
router.post("/send", sendMessage);
router.put("/update", updateMessage);
router.delete("/delete", deleteMessage);
router.get("/fetchChats/:channelId", getChatsByChannel);

export default router;
