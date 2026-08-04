import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 text-center">
      <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center mb-8 border border-primary-100">
        <Compass size={48} strokeWidth={1.5} />
      </div>
      <h1 className="text-6xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">404</h1>
      <p className="mt-4 text-xl text-slate-500 font-medium">This page drifted off the shelf.</p>
      <Link
        to="/"
        className="mt-8 bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary/20"
      >
        Back to search
      </Link>
    </div>
  );
};

export default NotFound;
