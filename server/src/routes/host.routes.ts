import { Router } from "express";
import { HostController } from "../controllers/HostController";

const router = Router();
const hostController = new HostController();

router.get("/", hostController.getAll);
router.get("/:id", hostController.getById);
router.post("/", hostController.create);
router.put("/:id", hostController.update);
router.delete("/:id", hostController.delete);
export default router;