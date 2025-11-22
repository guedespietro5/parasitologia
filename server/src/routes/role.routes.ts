import { Router } from "express";
import { RoleController } from "../controllers/RoleController";

const router = Router();
const roleController = new RoleController();

router.get("/", roleController.getAll);
router.get("/:id", roleController.getById);
router.post("/", roleController.create);
router.put("/:id", roleController.update);
router.delete("/:id", roleController.delete);

export default router;
