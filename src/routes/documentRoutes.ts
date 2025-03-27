import express from "express";
import {
  createDocument,
  getDocumentStatistics,
  getWorkersWithExpiredDocuments,
  getWorkersWithExpiringDocuments,
} from "../controllers/documentController";

const router = express.Router();

router.post("/", createDocument);
router.get("docuement/statistics", getDocumentStatistics);
router.get("documents/expiredDocument", getWorkersWithExpiredDocuments);
router.get("documents/expiringDocuments", getWorkersWithExpiringDocuments);
export default router;
