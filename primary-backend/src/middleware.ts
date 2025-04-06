import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

// Extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(403).json({
      message: "You are not logged in"
    });
    return;
  }
  
  // Extract token - handle Bearer prefix if present
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as { id: string };
    req.id = payload.id;
    next();
  } catch(e) {
    res.status(403).json({
      message: "You are not logged in"
    });
  }
}