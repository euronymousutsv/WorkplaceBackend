import express from "express";
import {
  getLoggedInUserServer,
  joinServer,
  registerServer,
} from "../../controllers/server/serverController";

const router = express.Router();
router.post("/register", registerServer);
router.get("/getLoggedInUserServer/", getLoggedInUserServer);
router.post("/joinServer", joinServer);

export default router;
