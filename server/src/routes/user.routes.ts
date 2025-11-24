import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = new UserController();

import { authMiddleware } from "../middleware/auth";

router.get("/", authMiddleware, userController.getAll);
router.get("/:id", authMiddleware, userController.getById);
router.post("/", userController.create);
router.put("/:id", authMiddleware, userController.update);
router.delete("/:id", authMiddleware, userController.delete);

export default router;