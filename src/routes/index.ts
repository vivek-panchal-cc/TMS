import { Router } from "express";
import authUserRouter from "./auth";
import userRouter from "./userRoutes";
import projectRoutes from "./projectRoutes";
import labelRoutes from "./labelRoutes";
import taskRoutes from "./taskRoutes";
import notificationRoutes from "./notificationRoutes";
import commentRoutes from "./commentRoutes";

const router = Router();

router.use("/users", authUserRouter);
router.use("/users", userRouter);
router.use("/projects", projectRoutes);
router.use("/labels", labelRoutes);
router.use("/tasks", taskRoutes);
router.use("/notifications", notificationRoutes);
router.use("/comments", commentRoutes);

export default router;
