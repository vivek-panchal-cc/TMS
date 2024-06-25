import express from 'express';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { upload } from '../storage';
import { taskValidation } from "../validators/userValidator";

const router = express.Router();

router.use(authMiddleware);

router.post("/index", checkRole(['admin']), TaskController.getAllTasks);
router.post("/create", upload.single('attachment'), taskValidation, validationMiddleware, checkRole(['admin', 'user']), TaskController.createTask);
router.get("/details/:id", checkRole(['admin', 'user']), TaskController.getTaskById);
router.put("/update/:id", upload.single('attachment'), taskValidation, validationMiddleware, checkRole(['admin', 'user']), TaskController.updateTask);
router.delete("/delete/:id", checkRole(['admin', 'user']), TaskController.deleteTask);
router.get("/my-tasks", checkRole(['admin', 'user']), TaskController.getTasksByUser);
router.patch("/:id/is-favourite", TaskController.setIsFavourite);
router.patch("/:id/is-priority", TaskController.setIsPriority);

export default router;
