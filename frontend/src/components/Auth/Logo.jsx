import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="group flex items-center gap-3 transition">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#3730A3] text-xl font-black text-white shadow-lg shadow-blue-500/20 transition-all group-hover:scale-105 group-hover:shadow-blue-500/30">
        <span className="font-extrabold tracking-tight">N</span>

        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition group-hover:opacity-100" />
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-bold tracking-tight text-[#172033] transition group-hover:text-[#2563EB]">
            NeuroForge
          </h1>

          <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#2563EB]">
            Nexus
          </span>
        </div>

        <span className="block text-[10px] font-medium uppercase tracking-widest text-[#64748B]">
          Enterprise SDLC
        </span>
      </div>
    </Link>
  );
};

export default Logo;