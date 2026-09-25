import { Link } from "react-router-dom";
import Logo from "../components/Auth/Logo.jsx";
import {
  PiFolder,
  PiListChecks,
  PiKanban,
  PiShieldCheck,
  PiUsers,
  PiChartLineUp,
  PiCheckCircle,
  PiArrowRight,
  PiLockKey,
  PiClock,
  PiBriefcase,
  PiSparkle,
} from "react-icons/pi";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#07111f] text-[#e8eef8] selection:bg-blue-500 selection:text-white overflow-x-hidden font-sans">
      {/* Ambient Lighting Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[140px] animate-float-1" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px] animate-float-2" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px] animate-float-3" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d08_1px,transparent_1px),linear-gradient(to_bottom,#1f293d08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-[#e8eef8]/10 bg-[#07111f]/80 backdrop-blur-xl transition">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Logo />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#e8eef8]/70">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#workflow" className="hover:text-white transition">Workflow</a>
            <a href="#architecture" className="hover:text-white transition">Architecture</a>
            <a href="#security" className="hover:text-white transition">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-[#e8eef8]/15 px-4 py-2 text-xs font-semibold text-[#e8eef8] transition hover:bg-[#e8eef8]/5 hover:border-[#e8eef8]/30"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-20 sm:px-10 lg:pt-24 lg:pb-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Pitch */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="hero-animate-badge inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400 shadow-sm shadow-blue-500/10">
              <PiSparkle size={14} className="text-cyan-400 animate-pulse" />
              <span>Enterprise SDLC & DevOps Platform</span>
            </div>

            <h1 className="hero-animate-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Plan, Decompose, and Ship Software with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Absolute Clarity
              </span>
            </h1>

            <p className="hero-animate-desc text-base sm:text-lg text-[#e8eef8]/70 leading-relaxed max-w-xl">
              From executive project governance to granular subtask execution, live velocity tracking, and role-scoped permissions — engineered for modern software delivery teams.
            </p>

            {/* Action Buttons */}
            <div className="hero-animate-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Get Started Free</span>
                <PiArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border border-[#e8eef8]/15 bg-[#0d1a2b]/60 px-6 py-3.5 text-sm font-semibold text-[#e8eef8] backdrop-blur-md transition-all duration-300 hover:bg-[#e8eef8]/10 hover:border-[#e8eef8]/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In to Workspace
              </Link>
            </div>

            {/* Role Coverage Badge */}
            <div className="hero-animate-tags pt-3">
              <p className="text-xs text-[#e8eef8]/50 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-[#e8eef8]/70">Built for:</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-purple-300 hover:border-purple-400/40 transition-colors">Admin</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-blue-300 hover:border-blue-400/40 transition-colors">Project Manager</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-cyan-300 hover:border-cyan-400/40 transition-colors">Project Lead</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-emerald-300 hover:border-emerald-400/40 transition-colors">Team Lead</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-amber-300 hover:border-amber-400/40 transition-colors">Developer</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-rose-300 hover:border-rose-400/40 transition-colors">Tester</span>
                <span className="rounded bg-[#0d1a2b] border border-[#e8eef8]/10 px-1.5 py-0.5 text-[11px] text-teal-300 hover:border-teal-400/40 transition-colors">QA</span>
              </p>
            </div>
          </div>

          {/* Right Column: Hero Interactive Workspace Preview */}
          <div className="lg:col-span-6 hero-animate-preview">
            <div className="relative animate-mockup-float rounded-2xl border border-[#e8eef8]/15 bg-[#0d1a2b]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-[#e8eef8]/10 bg-[#07111f]/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-[#e8eef8]/40">workspace / core-banking / tasks</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sprint Active
                </div>
              </div>

              {/* Workspace Mock Content */}
              <div className="p-5 space-y-4 text-left">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/80 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-[#07111f]">
                    <div className="flex items-center justify-between text-[#e8eef8]/50 text-[11px]">
                      <span>Projects</span>
                      <PiFolder size={13} className="text-blue-400" />
                    </div>
                    <div className="mt-1 text-xl font-bold text-white">12</div>
                    <div className="text-[10px] text-emerald-400 font-medium">100% on schedule</div>
                  </div>

                  <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/80 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-[#07111f]">
                    <div className="flex items-center justify-between text-[#e8eef8]/50 text-[11px]">
                      <span>Tasks</span>
                      <PiListChecks size={13} className="text-cyan-400" />
                    </div>
                    <div className="mt-1 text-xl font-bold text-white">48</div>
                    <div className="text-[10px] text-cyan-400 font-medium">32 in progress</div>
                  </div>

                  <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/80 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-[#07111f]">
                    <div className="flex items-center justify-between text-[#e8eef8]/50 text-[11px]">
                      <span>Velocity</span>
                      <PiChartLineUp size={13} className="text-purple-400" />
                    </div>
                    <div className="mt-1 text-xl font-bold text-white">94%</div>
                    <div className="text-[10px] text-purple-400 font-medium">+14% vs last sprint</div>
                  </div>
                </div>

                {/* Task Breakdown Preview Rows */}
                <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/60 overflow-hidden divide-y divide-[#e8eef8]/5">
                  <div className="flex items-center justify-between p-3 text-xs transition-colors duration-200 hover:bg-[#0d1a2b]/70 cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="font-semibold text-[#e8eef8]">JWT Authentication & RBAC Filter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        Done
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 text-xs transition-colors duration-200 hover:bg-[#0d1a2b]/70 cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-semibold text-[#e8eef8]">Parent Task Decomposition Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                        In Progress
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 text-xs transition-colors duration-200 hover:bg-[#0d1a2b]/70 cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-semibold text-[#e8eef8]">Team Member Status Synchronization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        In Review
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Status Micro Bar */}
                <div className="flex items-center justify-between rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/40 p-2.5 text-xs text-[#e8eef8]/60 transition-colors hover:bg-[#07111f]/60">
                  <div className="flex items-center gap-2">
                    <PiUsers size={15} className="text-blue-400" />
                    <span>Allocated Engineers:</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>16 Active across 3 Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Highlights */}
      <section className="relative z-10 border-y border-[#e8eef8]/10 bg-[#0d1a2b]/40 py-12 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/40 p-5 space-y-2 landing-card-glow hover:border-blue-500/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black transition-transform duration-300 group-hover:scale-110">01</span>
                <span>Zero Context Switching</span>
              </h3>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Single unified pane of glass for roadmap governance, sprint boards, subtask management, and member availability.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/40 p-5 space-y-2 landing-card-glow hover:border-indigo-500/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black transition-transform duration-300 group-hover:scale-110">02</span>
                <span>Role-Decides, Scope-Filters</span>
              </h3>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Fine-grained permissions guarantee members only interact with and modify data pertinent to their assignment.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/40 p-5 space-y-2 landing-card-glow hover:border-cyan-500/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black transition-transform duration-300 group-hover:scale-110">03</span>
                <span>Autonomous Status Control</span>
              </h3>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Team members independently manage Active, In Meeting, and Inactive states without administrative bottlenecking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-20 sm:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Platform Capabilities
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for the Full Software Lifecycle
          </p>
          <p className="text-sm text-[#e8eef8]/60 max-w-xl mx-auto">
            A comprehensive suite of governance, coordination, and tracking tools to guide initiatives from concept to deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-blue-500/40 hover:bg-[#0d1a2b] landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300">
              <PiFolder size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">Project Governance</h3>
            <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
              Maintain portfolio-level oversight, define project leaders, track status progression, and supervise cross-functional team allocations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-cyan-500/40 hover:bg-[#0d1a2b] landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300">
              <PiListChecks size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">Task Decomposition</h3>
            <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
              Deconstruct complex deliverables into manageable parent tasks and assignable subtasks with clear deadlines and priorities.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-indigo-500/40 hover:bg-[#0d1a2b] landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-300">
              <PiKanban size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">Sprint Kanban Boards</h3>
            <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
              Manage work visually across To Do, In Progress, Review, and Done. Move cards seamlessly with scoped dragging permissions.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-purple-500/40 hover:bg-[#0d1a2b] landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4 group-hover:scale-110 group-hover:border-purple-500/40 transition-all duration-300">
              <PiShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">Role-Scoped Security</h3>
            <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
              7 distinct operational tiers ensure that actions and sensitive management data remain protected and properly audited.
            </p>
          </div>

          {/* Card 5 */}
          <div className="group relative rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-emerald-500/40 hover:bg-[#0d1a2b] landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-300">
              <PiUsers size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-200 transition-colors">Live Resource Directory</h3>
            <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
              Track talent skillsets based on role, real-time presence (Active, In Meeting, Inactive), and project allocations.
            </p>
          </div>

          {/* Card 6 */}
          <div className="group relative rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-amber-500/40 hover:bg-[#0d1a2b] landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-300">
              <PiChartLineUp size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">Growth & Velocity Metrics</h3>
            <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
              Observe portfolio expansion, talent growth distributions, and delivery velocity charts directly from the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="relative z-10 border-t border-[#e8eef8]/10 bg-[#0d1a2b]/30 px-6 py-20 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Delivery Pipeline
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Concept to Certified Release
            </p>
            <p className="text-sm text-[#e8eef8]/60 max-w-xl mx-auto">
              Follow a disciplined, role-governed execution flow designed to eliminate bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 space-y-3 landing-card-glow hover:border-blue-500/40">
              <span className="inline-block text-2xl font-black text-blue-500 transition-transform duration-300 group-hover:scale-110">01</span>
              <h4 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">Project Inception</h4>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Project Managers define delivery scope, timeline, and assign technical Project Leads.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 space-y-3 landing-card-glow hover:border-cyan-500/40">
              <span className="inline-block text-2xl font-black text-cyan-400 transition-transform duration-300 group-hover:scale-110">02</span>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">Task Decomposition</h4>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Project Leads and Team Leads decompose deliverables into high-level parent tasks and subtasks.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 space-y-3 landing-card-glow hover:border-indigo-500/40">
              <span className="inline-block text-2xl font-black text-indigo-400 transition-transform duration-300 group-hover:scale-110">03</span>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">Execution & Sprints</h4>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Developers execute subtasks, transition statuses on the Kanban board, and link work items.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]/80 p-6 space-y-3 landing-card-glow hover:border-emerald-500/40">
              <span className="inline-block text-2xl font-black text-emerald-400 transition-transform duration-300 group-hover:scale-110">04</span>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors">QA & Validation</h4>
              <p className="text-xs text-[#e8eef8]/60 leading-relaxed">
                Testers and QA verify subtask compliance, certify quality metrics, and approve final release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Role Scoping Breakdown */}
      <section id="architecture" className="relative z-10 px-6 py-20 sm:px-10 max-w-7xl mx-auto text-left">
        <div className="rounded-3xl border border-[#e8eef8]/15 bg-gradient-to-br from-[#0d1a2b] via-[#0b1626] to-[#07111f] p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Core Architectural Principle
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Role decides the action. Assignment decides the data.
            </h3>
            <p className="text-sm text-[#e8eef8]/60">
              Users only see projects and tasks they are assigned to, preventing information overload and protecting data integrity across departments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/60 p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-[#07111f]/90">
              <span className="text-xs font-bold text-purple-400">Admin</span>
              <p className="text-xs text-[#e8eef8]/60">
                Organization oversight, system user directory, growth charts, and project lifecycle management.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/60 p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-[#07111f]/90">
              <span className="text-xs font-bold text-blue-400">Project Manager</span>
              <p className="text-xs text-[#e8eef8]/60">
                Project planning, milestone control, leadership appointments, and cross-team scheduling.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/60 p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-[#07111f]/90">
              <span className="text-xs font-bold text-cyan-400">Project & Team Leads</span>
              <p className="text-xs text-[#e8eef8]/60">
                Deliverable decomposition into parent tasks, subtask assignments, and technical coordination.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f]/60 p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-[#07111f]/90">
              <span className="text-xs font-bold text-emerald-400">Developer, Tester & QA</span>
              <p className="text-xs text-[#e8eef8]/60">
                Execute assigned subtasks, update task progress on Kanban, and verify build stability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust Strip */}
      <section id="security" className="relative z-10 border-t border-[#e8eef8]/10 bg-[#0d1a2b]/20 px-6 py-12 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <PiShieldCheck size={20} className="text-emerald-400" />
              <span>Enterprise-Grade Security & Authentication</span>
            </h4>
            <p className="text-xs text-[#e8eef8]/50 mt-1">
              Keycloak-ready identity provider integration with JWT-backed stateless authentication and CSRF token protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:border-blue-400/40">
              JWT Sessions
            </span>
            <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-400/40">
              Role-Based Access Control
            </span>
            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-400/40">
              Self-Only Status Security
            </span>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative z-10 px-6 py-16 sm:px-10 max-w-7xl mx-auto">
        <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-[#07111f] p-8 sm:p-14 text-center overflow-hidden shadow-2xl animate-pulse-glow">
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to streamline your engineering workflows?
            </h3>
            <p className="text-sm text-[#e8eef8]/70">
              Create an account or sign in to experience role-scoped project governance and task execution.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.99]"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto rounded-xl border border-[#e8eef8]/15 bg-[#0d1a2b]/80 px-6 py-3 text-sm font-semibold text-[#e8eef8] transition-all duration-300 hover:bg-[#e8eef8]/10 hover:border-[#e8eef8]/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e8eef8]/10 bg-[#07111f]/80 backdrop-blur-xl px-6 py-8 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#e8eef8]/40">
          <Logo />
          <span>© 2026 NeuroForge Nexus SDLC Platform. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[#e8eef8]/60">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <span>•</span>
            <a href="#features" className="hover:text-white transition">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}