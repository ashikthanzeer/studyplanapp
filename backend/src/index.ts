import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import subjectsRoutes from './routes/subjects';
import tasksRoutes from './routes/tasks';
import pomodoroRoutes from './routes/pomodoro';
import kanbanRoutes from './routes/kanban';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Study Planner API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/kanban', kanbanRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Study Planner API listening on port ${port}`);
});
