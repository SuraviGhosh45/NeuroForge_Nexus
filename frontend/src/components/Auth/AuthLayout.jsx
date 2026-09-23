import Logo from "./Logo.jsx";

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07111f] text-[#e8eef8] selection:bg-blue-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-[#e8eef8]/10 bg-[#07111f]/75 backdrop-blur-xl px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo />
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400 shadow-sm shadow-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Enterprise Secure IAM</span>
          </div>
        </div>
      </header>

      {/* Main Content Form Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e8eef8]/10 bg-[#07111f]/75 backdrop-blur-xl px-6 py-4 text-xs text-[#e8eef8]/40">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 NeuroForge Nexus. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[#e8eef8]/50">
            <span className="hover:text-white transition cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Compliance</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;