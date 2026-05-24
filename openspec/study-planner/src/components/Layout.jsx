const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'tasks', label: 'Tasks', icon: 'T' },
  { id: 'timer', label: 'Timer', icon: 'P' },
];

export function Header({ currentPage, onPageChange }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onPageChange('dashboard')}
          className="flex items-center gap-3 text-left"
          aria-label="Open dashboard"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 font-bold text-white shadow-sm">
            SP
          </span>
          <span>
            <span className="block text-lg font-bold text-slate-950">Study Planner</span>
            <span className="hidden text-xs text-slate-500 sm:block">Plan, focus, repeat</span>
          </span>
        </button>

        <nav className="hidden gap-2 lg:flex" aria-label="Primary navigation">
          {pages.map((page) => (
            <NavButton
              key={page.id}
              page={page}
              active={currentPage === page.id}
              onClick={() => onPageChange(page.id)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Sidebar({ currentPage, onPageChange }) {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 rounded-lg border border-slate-200 bg-white p-3 shadow-soft md:block">
      <nav className="space-y-1" aria-label="Sidebar navigation">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => onPageChange(page.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors ${
              currentPage === page.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            aria-current={currentPage === page.id ? 'page' : undefined}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-current text-[11px]">
              {page.icon}
            </span>
            {page.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav({ currentPage, onPageChange }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onPageChange(page.id)}
          className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
            currentPage === page.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
          aria-current={currentPage === page.id ? 'page' : undefined}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-current text-[11px]">
            {page.icon}
          </span>
          {page.label}
        </button>
      ))}
    </nav>
  );
}

function NavButton({ page, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {page.label}
    </button>
  );
}

export function MainContent({ children }) {
  return (
    <main className="min-w-0 flex-1 pb-24 md:pb-8">
      {children}
    </main>
  );
}
