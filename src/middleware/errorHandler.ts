import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.message === 'Unauthorized') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.message === 'Not Found') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};
