import { Router } from "express";
import userRouter from "./userRoutes";
import projectRoutes from "./projectRoutes";
import labelRoutes from "./labelRoutes";
import taskRoutes from "./taskRoutes";
import notificationRoutes from "./notificationRoutes";
import commentRoutes from "./commentRoutes";

const router = Router();

router.use("/users", userRouter);
router.use("/projects", projectRoutes);
router.use("/labels", labelRoutes);
router.use("/tasks", taskRoutes);
router.use("/notifications", notificationRoutes);
router.use("/comments", commentRoutes);

export default router;
