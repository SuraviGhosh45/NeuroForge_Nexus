import { Link } from "react-router-dom";
import Logo from "../components/Auth/Logo.jsx";
import {
  PiFolder,
  PiListChecks,
  PiKanban,
  PiShieldCheck,
  PiUsers,
  PiChartLineUp,
  PiArrowRight,
  PiSparkle,
} from "react-icons/pi";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden bg-[#e8eef7] text-[#172033] selection:bg-blue-600 selection:text-white font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/15 blur-[140px] animate-float-1" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-[140px] animate-float-2" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[140px] animate-float-3" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b12_1px,transparent_1px),linear-gradient(to_bottom,#64748b12_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-300/70 bg-[#e8eef7]/90 backdrop-blur-xl transition">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Logo />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#172033] transition">
              Features
            </a>
            <a href="#workflow" className="hover:text-[#172033] transition">
              Workflow
            </a>
            <a href="#architecture" className="hover:text-[#172033] transition">
              Architecture
            </a>
            <a href="#security" className="hover:text-[#172033] transition">
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#172033] transition hover:bg-slate-50 hover:border-slate-400"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-[#172033] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:bg-[#24324a] hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-16 pb-20 sm:px-10 lg:pt-24 lg:pb-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="hero-animate-badge inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
              <PiSparkle size={14} className="text-blue-600 animate-pulse" />
              <span>Enterprise SDLC & DevOps Platform</span>
            </div>

            <h1 className="hero-animate-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#172033] leading-[1.1]">
              Plan, Decompose, and Ship Software with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Absolute Clarity
              </span>
            </h1>

            <p className="hero-animate-desc text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              From executive project governance to granular subtask execution, live velocity tracking, and role-scoped permissions — engineered for modern software delivery teams.
            </p>

            <div className="hero-animate-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30 hover:brightness-110 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Get Started Free</span>
                <PiArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#172033] shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-400 hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In to Workspace
              </Link>
            </div>

            <div className="hero-animate-tags pt-3">
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-700">Built for:</span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-purple-700 hover:border-purple-300 transition-colors">
                  Admin
                </span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-blue-700 hover:border-blue-300 transition-colors">
                  Project Manager
                </span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-cyan-700 hover:border-cyan-300 transition-colors">
                  Project Lead
                </span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-emerald-700 hover:border-emerald-300 transition-colors">
                  Team Lead
                </span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-amber-700 hover:border-amber-300 transition-colors">
                  Developer
                </span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-rose-700 hover:border-rose-300 transition-colors">
                  Tester
                </span>

                <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] text-teal-700 hover:border-teal-300 transition-colors">
                  QA
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 hero-animate-preview">
            <div className="relative animate-mockup-float rounded-2xl border border-slate-300 bg-[#172033] backdrop-blur-2xl shadow-2xl shadow-slate-900/25 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-600 bg-[#111827] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">
                    workspace / core-banking / tasks
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sprint Active
                </div>
              </div>

              <div className="p-5 space-y-4 text-left">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-slate-700 bg-[#24324a] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Projects</span>
                      <PiFolder size={13} className="text-blue-400" />
                    </div>
                    <div className="mt-1 text-xl font-bold text-white">12</div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      100% on schedule
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-[#24324a] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Tasks</span>
                      <PiListChecks size={13} className="text-cyan-400" />
                    </div>
                    <div className="mt-1 text-xl font-bold text-white">48</div>
                    <div className="text-[10px] text-cyan-400 font-medium">
                      32 in progress
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-[#24324a] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/40">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Velocity</span>
                      <PiChartLineUp size={13} className="text-purple-400" />
                    </div>
                    <div className="mt-1 text-xl font-bold text-white">94%</div>
                    <div className="text-[10px] text-purple-400 font-medium">
                      +14% vs last sprint
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#111827] overflow-hidden divide-y divide-slate-700">
                  <div className="flex items-center justify-between p-3 text-xs transition-colors duration-200 hover:bg-[#24324a] cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="font-semibold text-slate-100">
                        JWT Authentication & RBAC Filter
                      </span>
                    </div>

                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Done
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 text-xs transition-colors duration-200 hover:bg-[#24324a] cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-semibold text-slate-100">
                        Parent Task Decomposition Engine
                      </span>
                    </div>

                    <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                      In Progress
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 text-xs transition-colors duration-200 hover:bg-[#24324a] cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-semibold text-slate-100">
                        Team Member Status Synchronization
                      </span>
                    </div>

                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      In Review
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#24324a] p-2.5 text-xs text-slate-300 transition-colors hover:bg-[#2d3c56]">
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

      <section className="relative z-10 border-y border-slate-300 bg-white/50 py-12 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="group rounded-2xl border border-slate-300 bg-white p-5 space-y-2 landing-card-glow hover:border-blue-300">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600 text-xs font-black transition-transform duration-300 group-hover:scale-110">
                  01
                </span>
                <span>Zero Context Switching</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Single unified pane of glass for roadmap governance, sprint boards, subtask management, and member availability.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-300 bg-white p-5 space-y-2 landing-card-glow hover:border-indigo-300">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-black transition-transform duration-300 group-hover:scale-110">
                  02
                </span>
                <span>Role-Decides, Scope-Filters</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Fine-grained permissions guarantee members only interact with and modify data pertinent to their assignment.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-300 bg-white p-5 space-y-2 landing-card-glow hover:border-cyan-300">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 text-xs font-black transition-transform duration-300 group-hover:scale-110">
                  03
                </span>
                <span>Autonomous Status Control</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Team members independently manage Active, In Meeting, and Inactive states without administrative bottlenecking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 px-6 py-20 sm:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Platform Capabilities
          </h2>

          <p className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            Engineered for the Full Software Lifecycle
          </p>

          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            A comprehensive suite of governance, coordination, and tracking tools to guide initiatives from concept to deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <div className="group relative rounded-2xl border border-slate-300 bg-white p-6 shadow-lg shadow-slate-900/5 hover:border-blue-400 hover:shadow-blue-100 landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mb-4 group-hover:scale-110 group-hover:border-blue-400 transition-all duration-300">
              <PiFolder size={22} />
            </div>

            <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-blue-700 transition-colors">
              Project Governance
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Maintain portfolio-level oversight, define project leaders, track status progression, and supervise cross-functional team allocations.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-300 bg-white p-6 shadow-lg shadow-slate-900/5 hover:border-cyan-400 landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 mb-4 group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300">
              <PiListChecks size={22} />
            </div>

            <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-cyan-700 transition-colors">
              Task Decomposition
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deconstruct complex deliverables into manageable parent tasks and assignable subtasks with clear deadlines and priorities.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-300 bg-white p-6 shadow-lg shadow-slate-900/5 hover:border-indigo-400 landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-4 group-hover:scale-110 group-hover:border-indigo-400 transition-all duration-300">
              <PiKanban size={22} />
            </div>

            <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-indigo-700 transition-colors">
              Sprint Kanban Boards
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Manage work visually across To Do, In Progress, Review, and Done. Move cards seamlessly with scoped dragging permissions.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-300 bg-white p-6 shadow-lg shadow-slate-900/5 hover:border-purple-400 landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 mb-4 group-hover:scale-110 group-hover:border-purple-400 transition-all duration-300">
              <PiShieldCheck size={22} />
            </div>

            <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-purple-700 transition-colors">
              Role-Scoped Security
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              7 distinct operational tiers ensure that actions and sensitive management data remain protected and properly audited.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-300 bg-white p-6 shadow-lg shadow-slate-900/5 hover:border-emerald-400 landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4 group-hover:scale-110 group-hover:border-emerald-400 transition-all duration-300">
              <PiUsers size={22} />
            </div>

            <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-emerald-700 transition-colors">
              Live Resource Directory
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Track talent skillsets based on role, real-time presence (Active, In Meeting, Inactive), and project allocations.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-300 bg-white p-6 shadow-lg shadow-slate-900/5 hover:border-amber-400 landing-card-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600 mb-4 group-hover:scale-110 group-hover:border-amber-400 transition-all duration-300">
              <PiChartLineUp size={22} />
            </div>

            <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-amber-700 transition-colors">
              Growth & Velocity Metrics
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Observe portfolio expansion, talent growth distributions, and delivery velocity charts directly from the dashboard.
            </p>
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10 border-t border-slate-300 bg-white/45 px-6 py-20 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Delivery Pipeline
            </h2>

            <p className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              From Concept to Certified Release
            </p>

            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Follow a disciplined, role-governed execution flow designed to eliminate bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="group rounded-2xl border border-slate-300 bg-white p-6 space-y-3 landing-card-glow hover:border-blue-400">
              <span className="inline-block text-2xl font-black text-blue-600 transition-transform duration-300 group-hover:scale-110">
                01
              </span>

              <h4 className="text-base font-bold text-[#172033] group-hover:text-blue-700 transition-colors">
                Project Inception
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                Project Managers define delivery scope, timeline, and assign technical Project Leads.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-300 bg-white p-6 space-y-3 landing-card-glow hover:border-cyan-400">
              <span className="inline-block text-2xl font-black text-cyan-600 transition-transform duration-300 group-hover:scale-110">
                02
              </span>

              <h4 className="text-base font-bold text-[#172033] group-hover:text-cyan-700 transition-colors">
                Task Decomposition
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                Project Leads and Team Leads decompose deliverables into high-level parent tasks and subtasks.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-300 bg-white p-6 space-y-3 landing-card-glow hover:border-indigo-400">
              <span className="inline-block text-2xl font-black text-indigo-600 transition-transform duration-300 group-hover:scale-110">
                03
              </span>

              <h4 className="text-base font-bold text-[#172033] group-hover:text-indigo-700 transition-colors">
                Execution & Sprints
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                Developers execute subtasks, transition statuses on the Kanban board, and link work items.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-300 bg-white p-6 space-y-3 landing-card-glow hover:border-emerald-400">
              <span className="inline-block text-2xl font-black text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                04
              </span>

              <h4 className="text-base font-bold text-[#172033] group-hover:text-emerald-700 transition-colors">
                QA & Validation
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                Testers and QA verify subtask compliance, certify quality metrics, and approve final release.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="relative z-10 px-6 py-20 sm:px-10 max-w-7xl mx-auto text-left">
        <div className="rounded-3xl border border-slate-400 bg-[#172033] p-8 sm:p-12 shadow-2xl shadow-slate-900/20 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Core Architectural Principle
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Role decides the action. Assignment decides the data.
            </h3>

            <p className="text-sm text-slate-300">
              Users only see projects and tasks they are assigned to, preventing information overload and protecting data integrity across departments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-600 bg-[#24324a] p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400">
              <span className="text-xs font-bold text-purple-400">Admin</span>

              <p className="text-xs text-slate-300">
                Organization oversight, system user directory, growth charts, and project lifecycle management.
              </p>
            </div>

            <div className="rounded-xl border border-slate-600 bg-[#24324a] p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400">
              <span className="text-xs font-bold text-blue-400">
                Project Manager
              </span>

              <p className="text-xs text-slate-300">
                Project planning, milestone control, leadership appointments, and cross-team scheduling.
              </p>
            </div>

            <div className="rounded-xl border border-slate-600 bg-[#24324a] p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400">
              <span className="text-xs font-bold text-cyan-400">
                Project & Team Leads
              </span>

              <p className="text-xs text-slate-300">
                Deliverable decomposition into parent tasks, subtask assignments, and technical coordination.
              </p>
            </div>

            <div className="rounded-xl border border-slate-600 bg-[#24324a] p-4 space-y-1 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400">
              <span className="text-xs font-bold text-emerald-400">
                Developer, Tester & QA
              </span>

              <p className="text-xs text-slate-300">
                Execute assigned subtasks, update task progress on Kanban, and verify build stability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="relative z-10 border-t border-slate-300 bg-white/40 px-6 py-12 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div>
            <h4 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <PiShieldCheck size={20} className="text-emerald-600" />
              <span>Enterprise-Grade Security & Authentication</span>
            </h4>

            <p className="text-xs text-slate-600 mt-1">
              Keycloak-ready identity provider integration with JWT-backed stateless authentication and CSRF token protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
              JWT Sessions
            </span>

            <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
              Role-Based Access Control
            </span>

            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              Self-Only Status Security
            </span>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-16 sm:px-10 max-w-7xl mx-auto">
        <div className="relative rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-white p-8 sm:p-14 text-center overflow-hidden shadow-xl shadow-blue-900/5 animate-pulse-glow">
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              Ready to streamline your engineering workflows?
            </h3>

            <p className="text-sm text-slate-600">
              Create an account or sign in to experience role-scoped project governance and task execution.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.99]"
              >
                Create Free Account
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#172033] transition-all duration-300 hover:bg-slate-50 hover:border-slate-400 hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-300 bg-[#172033] px-6 py-8 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <Logo />

          <span>
            © 2026 NeuroForge Nexus SDLC Platform. All rights reserved.
          </span>

          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white transition">
              Sign In
            </Link>

            <span>•</span>

            <Link to="/register" className="hover:text-white transition">
              Register
            </Link>

            <span>•</span>

            <a href="#features" className="hover:text-white transition">
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}