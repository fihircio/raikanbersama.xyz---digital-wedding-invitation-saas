import { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as Error & { statusCode: number };
  error.statusCode = 404;
  next(error);
};

export default notFound;