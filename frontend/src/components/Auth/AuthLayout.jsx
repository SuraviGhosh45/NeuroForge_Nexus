import Logo from "./Logo.jsx";

const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#f4f6fa] dark:bg-[#0b1120] text-[#172033] dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[450px] w-[450px] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[450px] w-[450px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-slate-400/10 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-[#CBD5E1] dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/90 px-6 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo />

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span>Enterprise Secure IAM</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="relative z-10 border-t border-[#CBD5E1] dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/90 px-6 py-4 text-xs text-[#64748B] dark:text-slate-400 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© 2026 NeuroForge Nexus. All rights reserved.</span>

          <div className="flex items-center gap-4 text-[#64748B] dark:text-slate-400">
            <span className="cursor-pointer transition hover:text-[#172033] dark:hover:text-slate-200">
              Security Protocol
            </span>

            <span>•</span>

            <span className="cursor-pointer transition hover:text-[#172033] dark:hover:text-slate-200">
              Compliance
            </span>

            <span>•</span>

            <span className="cursor-pointer transition hover:text-[#172033] dark:hover:text-slate-200">
              System Status
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;