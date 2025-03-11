import express from "express";
import { createNewChannel } from "../controllers/channelController";

const router = express.Router();
router.post("/create", createNewChannel);

export default router;
