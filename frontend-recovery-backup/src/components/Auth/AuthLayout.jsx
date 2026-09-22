import Logo from "./Logo.jsx";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="topbar">
        <Logo />
        <div className="security-status">
          <span className="status-dot"></span>
          Enterprise Secure Platform
        </div>
      </header>

      <main className="auth-container">{children}</main>

      <footer className="auth-footer">
        <span>© 2026 NeuroForge Nexus</span>
        <span>Enterprise SDLC Management Platform</span>
      </footer>
    </div>
  );
};

export default AuthLayout;