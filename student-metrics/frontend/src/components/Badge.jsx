import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function CategoryBadge({ category, size = 'sm' }) {
  const isLg = size === 'lg';
  const baseClasses = isLg
    ? 'px-3.5 py-1.5 text-sm font-semibold rounded-full inline-flex items-center gap-2 border'
    : 'px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 border';

  switch (category) {
    case 'Fast Learner':
      return (
        <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Fast Learner
        </span>
      );
    case 'Average Learner':
      return (
        <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Average Learner
        </span>
      );
    case 'Slow Learner':
      return (
        <span className={`${baseClasses} bg-rose-50 text-rose-700 border-rose-200`}>
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Slow Learner
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-slate-100 text-slate-700 border-slate-200`}>
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          {category || 'Unclassified'}
        </span>
      );
  }
}

export function TrendBadge({ trend, showLabel = true }) {
  switch (trend) {
    case 'Improving':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          {showLabel && 'Improving'}
        </span>
      );
    case 'Declining':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          {showLabel && 'Declining'}
        </span>
      );
    case 'Consistent':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          <Minus className="w-3.5 h-3.5 text-slate-500" />
          {showLabel && 'Consistent'}
        </span>
      );
  }
}

