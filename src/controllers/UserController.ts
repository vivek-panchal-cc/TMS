import { Request, Response } from "express";
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
}
