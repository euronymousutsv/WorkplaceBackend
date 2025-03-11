import express from "express";
import { createNewChannel } from "../../controllers/server/channelController";

const router = express.Router();
router.post("/create", createNewChannel);

export default router;
