import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { User } from "../entity/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class UserController {
  static async getProfile(req: Request, res: Response) {
    if (req.user) {
      return res.status(200).json({
        success: true,
        status_code: 200,
        message: "Profile fetched successfully",
        data: req.user,
      });
    } else {
      return res.status(404).json({
        success: false,
        status_code: 404,
        message: "User not found",
      });
    }
  }

  static async getUsers(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        where: { is_active: true },
      });

      const transformedUsers = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        address: user.address,
      }));

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Users fetched successfully",
        users: transformedUsers,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch users",
        error,
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const { id: userId } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    try {
      if (req.user.id === userId) {
        return res.status(403).json({
          status_code: 403,
          success: false,
          message: "You cannot delete your own account",
        });
      }
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "User not found",
        });
      }

      user.is_active = false;
      user.deleted_at = new Date();

      if (req.user) {
        user.deleted_by = req.user;
      }

      await userRepository.save(user);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete user",
        error,
      });
    }
  }

  static async deleteOwnAccount(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;
    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "User not found",
        });
      }

      user.is_active = false;
      user.deleted_at = new Date();
      if (req.user) {
        user.deleted_by = req.user;
      }

      await userRepository.save(user);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "User account deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete user account",
        error,
      });
    }
  }
}
