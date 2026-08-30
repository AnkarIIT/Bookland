import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).trim(),
});

export const bookKeySchema = z.object({
  key: z.string().min(1).max(100),
});

export const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100).trim(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1).max(128),
});

export const gutenbergReadSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()),
});

export const archiveReadSchema = z.object({
  id: z.string().min(1).max(200),
});

export interface ValidatedRequest extends Request {
  validatedQuery?: Record<string, unknown>;
  validatedParams?: Record<string, unknown>;
  validatedBody?: Record<string, unknown>;
}

export const validate = (schema: z.ZodSchema, source: 'query' | 'params' = 'query') => 
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const data = source === 'params' ? req.params : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    if (source === 'params') req.validatedParams = result.data as Record<string, unknown>;
    else req.validatedQuery = result.data as Record<string, unknown>;
    next();
  };

export const validateBody = (schema: z.ZodSchema) => 
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.validatedBody = result.data as Record<string, unknown>;
    next();
  };