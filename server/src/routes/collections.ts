import { Router, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get all saved books for authenticated user
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query(`
      SELECT b.*, sb.saved_at
      FROM saved_books sb
      JOIN books b ON b.isbn_13 = sb.book_isbn
      WHERE sb.user_id = $1
      ORDER BY sb.saved_at DESC
      LIMIT 100
    `, [req.user!.id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Collections fetch error:', error);
    next(error);
  }
});

// Save a book to user's collection
router.post('/:isbn', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isbnParam = req.params.isbn;
    const isbn = typeof isbnParam === 'string' ? isbnParam.replace(/\D/g, '') : '';
    
    const { rows } = await db.query(`
      INSERT INTO saved_books (user_id, book_isbn, saved_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, book_isbn) DO NOTHING
      RETURNING *
    `, [req.user!.id, isbn]);
    
    if (rows.length === 0) {
      return res.status(200).json({ message: 'Book already saved' });
    }
    
    res.status(201).json({ message: 'Book saved to collection' });
  } catch (error) {
    console.error('Save book error:', error);
    next(error);
  }
});

// Remove a book from user's collection
router.delete('/:isbn', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isbnParam = req.params.isbn;
    const isbn = typeof isbnParam === 'string' ? isbnParam.replace(/\D/g, '') : '';
    
    await db.query(`
      DELETE FROM saved_books 
      WHERE user_id = $1 AND book_isbn = $2
    `, [req.user!.id, isbn]);
    
    res.json({ message: 'Book removed from collection' });
  } catch (error) {
    console.error('Remove book error:', error);
    next(error);
  }
});

// Check if a book is saved
router.get('/exists/:isbn', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isbnParam = req.params.isbn;
    const isbn = typeof isbnParam === 'string' ? isbnParam.replace(/\D/g, '') : '';
    
    const { rows } = await db.query(`
      SELECT 1 FROM saved_books 
      WHERE user_id = $1 AND book_isbn = $2
    `, [req.user!.id, isbn]);
    
    res.json({ saved: rows.length > 0 });
  } catch (error) {
    console.error('Check saved error:', error);
    next(error);
  }
});

export default router;