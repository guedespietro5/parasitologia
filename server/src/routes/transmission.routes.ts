import { Router } from "express";
import { TransmissionController } from "../controllers/TransmissionController";

const router = Router();
const transmissionController = new TransmissionController();

router.get("/", transmissionController.getAll);
router.get("/:id", transmissionController.getById);
router.post("/", transmissionController.create);
router.put("/:id", transmissionController.update);
router.delete("/:id", transmissionController.delete);
export default router;