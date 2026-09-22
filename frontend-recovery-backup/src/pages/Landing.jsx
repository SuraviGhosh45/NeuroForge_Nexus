import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <div className="bg-glow"></div>

      <nav>
        <div className="wrap">
          <div className="logo">
            NeuroForge <span className="nexus">Nexus</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
          </div>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="/login">Sign In</a>
            <a className="btn btn-primary" href="/register">Create Account</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="hero-tag">SDLC & DevOps Management Platform</div>
            <h1>Plan, build, and ship software without switching tabs</h1>
            <p className="sub">
              Requirements, sprints, tasks, pipelines, and deployments — tracked
              in one workspace built for your team's actual workflow.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="/login">Sign In</a>
              <a className="btn btn-ghost" href="/register">Create Account</a>
            </div>
            <div className="hero-note">
              Role-based access for Admins, Project Managers, Developers, and Testers.
            </div>
          </div>

          <div className="mock">
            <div className="mock-bar"><span></span><span></span><span></span></div>
            <div className="mock-body">
              <div className="mock-row">
                <div className="mock-stat"><div className="num">12</div><div className="lab">Active Projects</div></div>
                <div className="mock-stat"><div className="num">48</div><div className="lab">Open Tasks</div></div>
                <div className="mock-stat"><div className="num">75%</div><div className="lab">Sprint Progress</div></div>
              </div>
              <div className="mock-list">
                <div className="mock-list-row"><span>Design homepage</span><span className="pill pill-progress">In Progress</span></div>
                <div className="mock-list-row"><span>API integration</span><span className="pill pill-todo">To Do</span></div>
                <div className="mock-list-row"><span>Auth module review</span><span className="pill pill-done">Done</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <div className="why">
        <div className="wrap why-wrap">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: 26 }}>Built for how teams actually work</h2>
          </div>
          <div className="why-grid">
            <div>
              <h3>No more scattered tools</h3>
              <p>One workspace instead of juggling five different apps for planning and tracking.</p>
            </div>
            <div>
              <h3>Built on role-based security</h3>
              <p>Every action is scoped to what a person's role should actually see or do.</p>
            </div>
            <div>
              <h3>Live, not static</h3>
              <p>Task boards and progress update as your team works, not after a manual refresh.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features">
        <div className="wrap">
          <div className="section-head">
            <h2>Everything your team needs to ship</h2>
            <p>One platform covering the full lifecycle, from planning to deployment tracking.</p>
          </div>
          <div className="features-grid">
            <FeatureCard icon="📁" title="Project & Task Management" text="Create projects, break work into tasks and subtasks, assign owners, and track status end to end." />
            <FeatureCard icon="🗂️" title="Sprint Planning & Kanban" text="Plan sprints, move tasks across To Do, In Progress, and Done on a live board." />
            <FeatureCard icon="🔐" title="Role-Based Access" text="Admins, Project Managers, Developers, and Testers each see exactly what they need." />
            <FeatureCard icon="👥" title="Team Management" text="Build teams, assign members to projects, and manage roles at a glance." />
            <FeatureCard icon="⚙️" title="Build & Deployment Tracking" text="Track pipeline status and deployment history alongside your task board." />
            <FeatureCard icon="📊" title="Reports & Analytics" text="See progress, task distribution, and team activity without leaving the dashboard." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="wrap">
          <div className="section-head">
            <h2>How it works</h2>
            <p>The same flow your team already follows — just in one place.</p>
          </div>
          <div className="flow">
            <FlowStep idx="01" title="Create a project" text="Set up a project, define its scope, and add your team." />
            <FlowStep idx="02" title="Plan the sprint" text="Break work into tasks and assign them to team members." />
            <FlowStep idx="03" title="Track progress" text="Move tasks across the board as work gets done." />
            <FlowStep idx="04" title="Monitor deployment" text="Follow build status and releases from the same dashboard." />
          </div>
        </div>
      </section>

      {/* QUOTE — placeholder, replace with a real quote before submission */}
      <section id="quote">
        <div className="wrap quote-wrap">
          <p className="quote-text">
            "We stopped switching between four tools just to know where a task stood."
          </p>
          <p className="quote-attribution">
            — Placeholder quote, replace with real feedback once your team pilots it
          </p>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust">
        <div className="wrap">
          <p>Built on a secure, role-based foundation</p>
          <div className="badges">
            <div className="badge">JWT Authentication</div>
            <div className="badge">Role-Based Access Control</div>
            <div className="badge">Encrypted Passwords</div>
          </div>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="logo" style={{ fontSize: 16 }}>
            NeuroForge <span className="nexus">Nexus</span>
          </div>
          <div className="foot-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="https://github.com/neharajput07" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function FlowStep({ idx, title, text }) {
  return (
    <div className="flow-step">
      <div className="idx">{idx}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}