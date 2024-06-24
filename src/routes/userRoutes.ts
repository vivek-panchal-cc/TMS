import express from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/profile", authMiddleware, checkRole(["admin", "user"]), UserController.getProfile);
router.get('/users-list', authMiddleware, UserController.getUsers);
router.post('/delete', authMiddleware, checkRole(["admin"]), UserController.deleteUser);
router.delete('/delete-user', authMiddleware, UserController.deleteOwnAccount);
router.get("/admin", authMiddleware, checkRole(["admin"]), (req, res) => {
  res.send("Welcome Admin");
});

export default router;
