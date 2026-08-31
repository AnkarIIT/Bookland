import { Router, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get user's reading history
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const { rows } = await db.query(\`
      SELECT b.*, rh.progress_percent, rh.last_page, rh.last_read_at
      FROM reading_history rh
      JOIN books b ON b.isbn_13 = rh.book_isbn
      WHERE rh.user_id = $1
      ORDER BY rh.last_read_at DESC
      LIMIT $2 OFFSET $3
    \`, [req.user!.id, limit, offset]);
    
    const totalCount = await db.query(
      'SELECT COUNT(*) FROM reading_history WHERE user_id = $1',
      [req.user!.id]
    );
    
    res.json({
      history: rows,
      total: parseInt(totalCount.rows[0].count),
      limit,
      offset
    });
  } catch (error) {
    console.error('History fetch error:', error);
    next(error);
  }
});

// Update reading progress
router.patch('/:isbn', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isbnParam = req.params.isbn;
    const isbn = typeof isbnParam === 'string' ? isbnParam.replace(/\D/g, '') : '';
    const { last_page, progress_percent } = req.body;
    
    const { rows } = await db.query(\`
      INSERT INTO reading_history (user_id, book_isbn, last_page, progress_percent, last_read_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, book_isbn) 
      DO UPDATE SET 
        last_page = EXCLUDED.last_page,
        progress_percent = EXCLUDED.progress_percent,
        last_read_at = NOW()
      RETURNING *
    \`, [req.user!.id, isbn, last_page, progress_percent]);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Progress update error:', error);
    next(error);
  }
});

// Get specific book progress
router.get('/book/:isbn', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isbnParam = req.params.isbn;
    const isbn = typeof isbnParam === 'string' ? isbnParam.replace(/\D/g, '') : '';
    
    const { rows } = await db.query(\`
      SELECT last_page, progress_percent, last_read_at
      FROM reading_history 
      WHERE user_id = $1 AND book_isbn = $2
    \`, [req.user!.id, isbn]);
    
    if (rows.length === 0) {
      return res.json({ progress: 0, last_page: 0, last_read_at: null });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Book progress fetch error:', error);
    next(error);
  }
});

export default router;
