import { Router } from "express";
import { PostController } from "../controllers/PostController";

const router = Router();
const postController = new PostController();

router.get("/", postController.getAll);
router.get("/:id", postController.getById);
router.post("/", postController.create);
router.put("/:id", postController.update);
router.delete("/:id", postController.delete);
export default router;