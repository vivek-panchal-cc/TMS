import { Request, Response, NextFunction } from "express";

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // Assume req.user is populated by auth middleware
    if (!user) {
      return res.status(401).send("Access Denied");
    }
    if (!roles.includes(user.role)) {
      return res.status(403).send("Permission Denied");
    }
    next();
  };
};
