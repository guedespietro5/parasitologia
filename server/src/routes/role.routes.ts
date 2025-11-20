import { Router } from "express";
import { RoleController } from "../controllers/RoleController";

const router = Router();
const controller = new RoleController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
