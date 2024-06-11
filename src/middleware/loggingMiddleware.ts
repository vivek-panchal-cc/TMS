// loggingMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const { method, url, body, params, query } = req;
  console.log(`${timestamp} - ${method} ${url}`);
  console.log('Request Body:', body);
  console.log('Request Params:', params);
  console.log('Query Params:', query);
  next();
};
