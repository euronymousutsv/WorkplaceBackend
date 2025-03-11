import express from "express";
import {
  deleteMessage,
  sendMessage,
  updateMessage,
} from "../../controllers/server/chatController";

const router = express.Router();
router.post("/send", sendMessage);
router.put("/update", updateMessage);
router.delete("/delete", deleteMessage);

export default router;
