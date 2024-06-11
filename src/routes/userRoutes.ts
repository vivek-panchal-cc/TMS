import express from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/profile", authMiddleware, checkRole(["admin", "user"]), UserController.getProfile);
router.get("/admin", authMiddleware, checkRole(["admin"]), (req, res) => {
  res.send("Welcome Admin");
});

export default router;
