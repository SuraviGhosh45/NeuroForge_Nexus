import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 group transition">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-black text-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all">
        <span className="font-extrabold tracking-tight">N</span>
        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition">
            NeuroForge
          </h1>
          <span className="rounded-md bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-400 uppercase">
            Nexus
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-widest text-[#e8eef8]/40 uppercase block">
          Enterprise SDLC
        </span>
      </div>
    </Link>
  );
};

export default Logo;