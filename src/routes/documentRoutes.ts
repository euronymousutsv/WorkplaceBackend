import express from "express";
import {
  createDocument,
  getDocumentStatistics,
  getWorkersWithExpiredDocuments,
  getWorkersWithExpiringDocuments,
  getDocumentsByEmployeeId,
} from "../controllers/documentController";

const router = express.Router();

router.post("/", createDocument);

router.get("/statistics", getDocumentStatistics);
router.get("/expiredDocument", getWorkersWithExpiredDocuments);
router.get("/expiringDocuments", getWorkersWithExpiringDocuments);
router.get("/employee/:employeeId", getDocumentsByEmployeeId);
export default router;
