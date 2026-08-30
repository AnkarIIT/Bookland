import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { SEO } from '../components/SEO';

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

  const inputClass =
    'w-full bg-canvas dark:bg-dark-raised border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3.5 text-[15px] text-ink dark:text-white placeholder:text-muted dark:placeholder:text-dark-muted outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full animate-fade-up">
      <SEO
        title={isLogin ? 'Sign In' : 'Create Account'}
        description={isLogin ? 'Sign in to your Bookland account' : 'Create a free Bookland account'}
        canonical={isLogin ? '/login' : '/register'}
        noindex={true}
      />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary-600 shadow-button flex items-center justify-center">
            <span className="font-display font-extrabold text-white text-xl tracking-tighter">B</span>
          </div>
          <h1 className="font-display font-extrabold tracking-tightest text-4xl text-ink dark:text-white">
            {isLogin ? 'Welcome back' : 'Join Bookland'}
          </h1>
          <p className="mt-2 font-medium text-muted dark:text-dark-muted">
            {isLogin ? 'Sign in to continue to your library' : 'Create a free account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-lift p-6 space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass} pl-11`}
                placeholder="Full name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} pl-11`}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pl-11`}
              placeholder={isLogin ? 'Password' : 'At least 8 characters'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {(formError || error) && (
            <p className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
              {formError || error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full !py-4">
            {isLoading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm font-medium text-muted dark:text-dark-muted">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link to={isLogin ? '/register' : '/login'} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              {isLogin ? 'Create one' : 'Sign in'}
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-muted/70 dark:text-dark-muted/70">
          Free forever. No card required.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
