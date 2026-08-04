import React from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center py-24 animate-fade-up">
      <p className="font-display font-extrabold tracking-tightest text-[7rem] leading-none text-slate-100 dark:text-dark-raised select-none">
        404
      </p>
      <h1 className="-mt-10 font-display font-extrabold tracking-tightest text-3xl text-ink dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm font-medium text-muted dark:text-dark-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link to="/" className="btn-primary">
          Go home
        </Link>
        <Link to="/search" className="btn-secondary">
          <SearchIcon size={16} /> Search books
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
