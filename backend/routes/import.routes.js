import express from "express";
import { runImportForFeed } from "../controllers/imoprt.controller.js";
const router = express.Router();

router.post("/run-import", runImportForFeed);

export default router;
