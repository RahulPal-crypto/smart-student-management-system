import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, UserDoc, StudentDoc, TeacherDoc } from '../db/database';
import { generateToken, AuthRequest } from '../middleware/auth';
import { LoginSchema } from '../validators/schemas';
import { AuditService } from '../services/auditService';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid login details.',
        });
      }

      const { email, password, role } = parsed.data;
      const user = db.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role && u.status === 'Active'
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email, password, or role selection.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email, password, or role selection.',
        });
      }

      const token = generateToken(user);

      let profileData: StudentDoc | TeacherDoc | null = null;
      if (user.role === 'student' && user.linkedId) {
        profileData = db.students.find((s) => s.id === user.linkedId) || null;
      } else if (user.role === 'teacher' && user.linkedId) {
        profileData = db.teachers.find((t) => t.id === user.linkedId) || null;
      }

      AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGIN',
        module: 'Authentication',
        details: `User logged in successfully with ${user.role.toUpperCase()} role.`,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'],
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            linkedId: user.linkedId,
          },
          profile: profileData,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal authentication server error.',
      });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = req.user;
    let profileData: any = null;
    if (user.role === 'student' && user.linkedId) {
      profileData = db.students.find((s) => s.id === user.linkedId) || null;
    } else if (user.role === 'teacher' && user.linkedId) {
      profileData = db.teachers.find((t) => t.id === user.linkedId) || null;
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          linkedId: user.linkedId,
        },
        profile: profileData,
      },
    });
  }

  static async logout(req: AuthRequest, res: Response) {
    if (req.user) {
      AuditService.log({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'USER_LOGOUT',
        module: 'Authentication',
        details: 'User logged out of session.',
      });
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
}
