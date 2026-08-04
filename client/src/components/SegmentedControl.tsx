import React from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-0.5 p-1 rounded-full bg-slate-200/70 dark:bg-dark-raised/60 border border-slate-200/60 dark:border-dark-border/60"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full font-semibold transition-all duration-200 whitespace-nowrap ${
              size === 'sm' ? 'px-3.5 py-1.5 text-xs' : 'px-5 py-2 text-sm'
            } ${
              active
                ? 'bg-surface dark:bg-white text-ink dark:text-slate-900 shadow-soft'
                : 'text-muted hover:text-ink dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
