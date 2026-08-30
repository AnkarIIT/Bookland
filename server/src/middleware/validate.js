const { z } = require('zod');

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).trim(),
});

const bookKeySchema = z.object({
  key: z.string().min(1).max(100),
});

const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100).trim(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1).max(128),
});

const gutenbergReadSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()),
});

const archiveReadSchema = z.object({
  id: z.string().min(1).max(200),
});

const validate = (schema, source = 'body') => (req, res, next) => {
  const data = source === 'params' ? req.params : req.query;
  const result = schema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  if (source === 'params') req.validatedParams = result.data;
  else req.validatedQuery = result.data;
  next();
};

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  req.validatedBody = result.data;
  next();
};

module.exports = {
  validate,
  validateBody,
  searchQuerySchema,
  bookKeySchema,
  registerSchema,
  loginSchema,
  gutenbergReadSchema,
  archiveReadSchema,
};