import { useEffect, useState } from "react";
import {
PiBuildings,
PiBell,
PiFlask,
PiShieldCheck,
PiSlidersHorizontal,
PiCheckCircle,
} from "react-icons/pi";
import "./AdminSettings.css";

const DEFAULT_SETTINGS = {
workspaceName: "NeuroForge Nexus",
defaultVisibility: "Private",
allowMemberInvites: false,
testingEnabled: true,
requireBugSeverity: true,
emailNotifications: true,
securityAlerts: true,
};

const STORAGE_KEY = "neuroforge-admin-settings";

const sections = [
{ id: "workspace", label: "Workspace", icon: PiBuildings },
{ id: "testing", label: "Testing Defaults", icon: PiFlask },
{ id: "notifications", label: "Notifications", icon: PiBell },
{ id: "security", label: "Security", icon: PiShieldCheck },
];

function loadSettings() {
try {
const saved = localStorage.getItem(STORAGE_KEY);
return saved
? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
: DEFAULT_SETTINGS;
} catch {
return DEFAULT_SETTINGS;
}
}

function Toggle({ checked, onChange, label, description }) {
return ( <label className="admin-setting-toggle-row"> <span className="admin-setting-toggle-copy"> <span className="admin-setting-label">{label}</span> <span className="admin-setting-description">{description}</span> </span>


  <input
    type="checkbox"
    checked={checked}
    onChange={(event) => onChange(event.target.checked)}
    className="admin-setting-checkbox"
  />
  <span className="admin-setting-switch" aria-hidden="true" />
</label>


);
}

export default function AdminSettings() {
const [settings, setSettings] = useState(loadSettings);
const [activeSection, setActiveSection] = useState("workspace");
const [savedMessage, setSavedMessage] = useState("");

useEffect(() => {
if (!savedMessage) return undefined;


const timeout = setTimeout(() => setSavedMessage(""), 2500);
return () => clearTimeout(timeout);


}, [savedMessage]);

const updateSetting = (key, value) => {
setSettings((current) => ({ ...current, [key]: value }));
setSavedMessage("");
};

const saveSettings = () => {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
setSavedMessage("Admin preferences saved in this browser.");
} catch {
setSavedMessage("Unable to save settings in this browser.");
}
};

const resetSettings = () => {
setSettings({ ...DEFAULT_SETTINGS });
setSavedMessage("");
};

const active = sections.find((section) => section.id === activeSection);

return ( <main className="admin-settings-page"> <header className="admin-settings-header"> <div> <div className="admin-settings-eyebrow"> <PiShieldCheck /> ADMINISTRATION </div> <h1>Admin Settings</h1> <p>
Manage default workspace preferences and project-wide policies. </p> </div>


    <span className="admin-settings-badge">
      <PiShieldCheck /> Administrator
    </span>
  </header>

  <div className="admin-settings-notice">
    <PiShieldCheck />
    <p>
      These are prototype settings stored in this browser. They do not
      yet update the backend or enforce organization-wide policies.
    </p>
  </div>

  <div className="admin-settings-layout">
    <nav className="admin-settings-nav" aria-label="Admin settings sections">
      {sections.map((section) => {
        const Icon = section.icon;

        return (
          <button
            key={section.id}
            type="button"
            className={`admin-settings-nav-item ${
              activeSection === section.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <Icon />
            <span>{section.label}</span>
          </button>
        );
      })}
    </nav>

    <section className="admin-settings-panel">
      <div className="admin-settings-panel-heading">
        <div className="admin-settings-section-icon">
          {active && <active.icon />}
        </div>
        <div>
          <h2>{active?.label}</h2>
          <p>Configure defaults for your workspace.</p>
        </div>
      </div>

      {activeSection === "workspace" && (
        <div className="admin-settings-fields">
          <label className="admin-setting-field">
            <span className="admin-setting-label">Workspace name</span>
            <input
              value={settings.workspaceName}
              onChange={(event) =>
                updateSetting("workspaceName", event.target.value)
              }
              maxLength={100}
              placeholder="Enter workspace name"
            />
            <span className="admin-setting-description">
              Display name for your SDLC workspace.
            </span>
          </label>

          <label className="admin-setting-field">
            <span className="admin-setting-label">
              Default project visibility
            </span>
            <select
              value={settings.defaultVisibility}
              onChange={(event) =>
                updateSetting("defaultVisibility", event.target.value)
              }
            >
              <option value="Private">Private</option>
              <option value="Team">Team</option>
            </select>
            <span className="admin-setting-description">
              A default preference for newly created projects. This
              selection does not change existing project permissions.
            </span>
          </label>

          <Toggle
            checked={settings.allowMemberInvites}
            onChange={(value) => updateSetting("allowMemberInvites", value)}
            label="Allow member invitations"
            description="Workspace preference for member invitations. Backend enforcement is not connected."
          />
        </div>
      )}

      {activeSection === "testing" && (
        <div className="admin-settings-fields">
          <Toggle
            checked={settings.testingEnabled}
            onChange={(value) => updateSetting("testingEnabled", value)}
            label="Enable testing module by default"
            description="Sets the saved default preference for testing features."
          />

          <Toggle
            checked={settings.requireBugSeverity}
            onChange={(value) => updateSetting("requireBugSeverity", value)}
            label="Require bug severity"
            description="Recommended default for new bug reports. Form validation must be connected separately."
          />
        </div>
      )}

      {activeSection === "notifications" && (
        <div className="admin-settings-fields">
          <Toggle
            checked={settings.emailNotifications}
            onChange={(value) => updateSetting("emailNotifications", value)}
            label="Email notification preference"
            description="Default preference for future notification configuration."
          />

          <Toggle
            checked={settings.securityAlerts}
            onChange={(value) => updateSetting("securityAlerts", value)}
            label="Security alert preference"
            description="Save the desired security-alert setting for later backend integration."
          />
        </div>
      )}

      {activeSection === "security" && (
        <div className="admin-settings-fields">
          <div className="admin-settings-security-card">
            <PiShieldCheck />
            <div>
              <h3>Role-based access control</h3>
              <p>
                The Admin Settings page is restricted through the
                frontend route. Sensitive operations must also be
                authorized by the backend.
              </p>
            </div>
          </div>

          <div className="admin-settings-security-card">
            <PiSlidersHorizontal />
            <div>
              <h3>Authentication policies</h3>
              <p>
                Password rules, session expiry, and account lockout
                require implementation in the authentication backend.
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="admin-settings-actions">
        <div className="admin-settings-feedback" role="status">
          {savedMessage && (
            <>
              <PiCheckCircle />
              <span>{savedMessage}</span>
            </>
          )}
        </div>

        <button
          type="button"
          className="admin-settings-reset"
          onClick={resetSettings}
        >
          Reset
        </button>

        <button
          type="button"
          className="admin-settings-save"
          onClick={saveSettings}
        >
          Save preferences
        </button>
      </footer>
    </section>
  </div>
</main>


);
}
