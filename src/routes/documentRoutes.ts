import express from "express";
import {
  createDocument,
  getDocumentStatistics,
  getWorkersWithExpiredDocuments,
  getWorkersWithExpiringDocuments,
  getDocumentsByEmployeeId,
  updateDocument,
} from "../controllers/documentController";

const router = express.Router();

router.post("/addDocument", createDocument);
router.get("/statistics", getDocumentStatistics);
router.get("/expiredDocument", getWorkersWithExpiredDocuments);
router.get("/expiringDocuments", getWorkersWithExpiringDocuments);
router.get("/employee/:employeeId", getDocumentsByEmployeeId);
router.put("/update/:id", updateDocument);
export default router;
