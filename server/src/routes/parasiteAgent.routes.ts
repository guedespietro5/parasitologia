import { Router } from "express";
import { ParasiteAgentController } from "../controllers/ParasiteAgentController";

const router = Router();
const parasiteagentController = new ParasiteAgentController();

router.get("/", parasiteagentController.getAll);
router.get("/:id", parasiteagentController.getById);
router.post("/", parasiteagentController.create);
router.put("/:id", parasiteagentController.update);
router.delete("/:id", parasiteagentController.delete);
export default router;