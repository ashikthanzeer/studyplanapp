export function Badge({ children, color = 'blue', size = 'md' }) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
    yellow: 'bg-amber-50 text-amber-800 ring-amber-200',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
    gray: 'bg-slate-50 text-slate-700 ring-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-block rounded-full font-semibold ring-1 ${colorStyles[color]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
