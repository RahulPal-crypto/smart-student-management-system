import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDoc } from '../db/database';

export interface AuthRequest extends Request {
  user?: UserDoc;
}

const JWT_SECRET = process.env.JWT_SECRET || 'smart_sms_jwt_secret_key_prod_2026';

export const generateToken = (user: UserDoc): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      linkedId: user.linkedId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };
    const user = db.users.find((u) => u.id === decoded.id && u.status === 'Active');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or token invalid. Please log in again.',
    });
  }
};

export const requireRole = (...allowedRoles: Array<'admin' | 'teacher' | 'student'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] permissions.`,
      });
    }

    next();
  };
};
