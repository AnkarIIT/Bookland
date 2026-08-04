import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Library, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim()) return setFormError('Please enter your email');
    if (password.length < 8) return setFormError('Password must be at least 8 characters');

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) return setFormError('Please enter your name');
        await register(email.trim(), name.trim(), password);
      }
      navigate('/');
    } catch {
      // error message is stored in the auth store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary/20">
              <Library className="text-white" size={24} />
            </div>
            <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Bookland</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {isLogin ? 'Sign in to continue to your library' : 'Join Bookland and start exploring'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium p-8 space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Full name</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>
          </div>

          {(formError || error) && (
            <p className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm font-medium text-slate-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </Link>
          </p>
        </form>

        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <ArrowLeft size={16} /> Back to search
        </Link>
      </div>
    </div>
  );
};

export default AuthPage;
