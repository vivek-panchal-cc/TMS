import { Router } from "express";
import CommentController from "../controllers/CommentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.post("/add", CommentController.addComment);
router.put("/:id/edit", CommentController.editComment);
router.delete("/:id/delete-comment", CommentController.deleteComment);
router.get("/:taskId/task-comments", CommentController.getTaskComments);

export default router;
