import { Router } from "express";
import {
  upload,
  uploadMiddleware,
} from "../../controllers/files/fileController";

const router = Router();
router.post("/upload", uploadMiddleware, upload);

export default router;
