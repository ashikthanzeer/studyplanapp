export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    outline: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500',
  };

  const sizes = {
    sm: 'min-h-9 px-3 py-1.5 text-sm',
    md: 'min-h-10 px-4 py-2 text-sm',
    lg: 'min-h-12 px-5 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
