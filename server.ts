import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db/database';
import authRoutes from './server/routes/authRoutes';
import adminRoutes from './server/routes/adminRoutes';
import teacherRoutes from './server/routes/teacherRoutes';
import studentRoutes from './server/routes/studentRoutes';
import commonRoutes from './server/routes/commonRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database with Admin (Sonam Pal) and sample institutional data
  await db.init();

  // Standard middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic API Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      institution: db.settings.institutionName,
      developer: 'Sonam Pal',
      system: 'Smart Student Management System',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/common', commonRoutes);
  app.use('/api', commonRoutes);

  // Global Error Handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    });
  });

  // Vite development middleware or static production serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart SMS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
