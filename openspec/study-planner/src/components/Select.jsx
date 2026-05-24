export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
