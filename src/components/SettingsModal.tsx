import React, { useState } from "react";
import { UserIcon, PaletteIcon, RefreshCcwIcon, CogIcon, BellIcon, KeyIcon, UsersIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AccountSettings from "./settings/AccountSettings";
import PreferenceSettings from "./settings/PreferenceSettings";

const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState("User");
  const [serverUrl, setServerUrl] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("system");
  const { user, updateProfile } = useAuth();

  const sections: {
    [key: string]: Array<{ name: string; icon: React.ReactNode }>
  } = {
    "Account": [
      { name: "User", icon: <UserIcon strokeWidth={1} /> },
      { name: "Preferences", icon: <CogIcon strokeWidth={1} /> },
      { name: "Notifications", icon: <BellIcon strokeWidth={1} /> },
    ],
    "Workspace": [
      { name: "Appearance", icon: <PaletteIcon strokeWidth={1} /> },
      { name: "Connection", icon: <RefreshCcwIcon strokeWidth={1} /> },
      { name: "People", icon: <UsersIcon strokeWidth={1} /> },
      { name: "Security", icon: <KeyIcon strokeWidth={1} /> },
    ],
  };

  return (
    <div className="fixed text-md inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-[var(--bg-color)] text-[var(--text-color)] border-1 border-[var(--sidebar-border)] rounded-lg shadow-lg w-full max-w-6xl h-[80vh] flex opacity-100">
        <div className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] p-4">
          <nav className="space-y-0">
            {Object.keys(sections).map((sectionName) => (
              <div className="space-y-0.5 mb-4" key={sectionName}>
                <h3 className="text-sm font-bold text-[var(--muted-text)] mb-2">{sectionName}</h3>
                {sections[sectionName].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveSection(item.name)}
                    className={`w-full text-left py-1 px-4 rounded-md flex items-center gap-2 ${
                      activeSection === item.name
                        ? "bg-[var(--active-item)] text-[var(--text-color)]"
                        : "hover:bg-[var(--active-item)]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{activeSection}</h2>
          </div>
          <div className="bg-[var(--sidebar-bg)] p-4 rounded-[var(--border-radius)] border border-[var(--sidebar-border)]">
            {activeSection === "User" && <AccountSettings user={user} updateProfile={updateProfile}/>}
            {activeSection === "Preferences" && <PreferenceSettings />}
            {activeSection === "Connection" && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Server to Connect</label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="Enter server URL"
                    className="block w-full bg-[var(--bg-color)] border-[var(--sidebar-border)] rounded-md shadow-sm focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] text-[var(--text-color)] sm:text-sm p-2"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[var(--primary-button)] text-[var(--text-color)] py-2 px-4 rounded-md shadow hover:bg-[var(--primary-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-button)] focus:ring-offset-2"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;