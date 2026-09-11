import { db, AuditLogDoc } from '../db/database';

export interface AuditParams {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static log(params: AuditParams) {
    const entry: AuditLogDoc = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      module: params.module,
      details: params.details,
      ipAddress: params.ipAddress || '127.0.0.1 (Web Portal)',
      userAgent: params.userAgent || 'Smart SMS Web Client',
      timestamp: new Date().toISOString(),
    };

    db.auditLogs.unshift(entry); // newest first
    if (db.auditLogs.length > 500) {
      db.auditLogs.pop(); // keep latest 500
    }
  }
}
