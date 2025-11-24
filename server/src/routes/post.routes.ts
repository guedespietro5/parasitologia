import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const postController = new PostController();

router.get("/", postController.getAll);
router.get("/author/:id", postController.getByAuthorId);
router.get("/pending", postController.getPendingPosts);
router.get("/:id", postController.getById);
router.put("/:id/validate", postController.validatePost);
router.post("/", authMiddleware, postController.create);
router.put("/:id", authMiddleware, postController.update);
router.delete("/:id", authMiddleware, postController.delete);
export default router;