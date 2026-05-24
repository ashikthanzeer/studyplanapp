export function Input({ label, type = 'text', value, onChange, placeholder, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
        {...props}
      />
    </div>
  );
}
