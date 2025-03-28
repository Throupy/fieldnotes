import React, { useState } from "react";
import {
  UserIcon,
  PaletteIcon,
  RefreshCcwIcon,
  CogIcon,
  BellIcon,
  KeyIcon,
  UsersIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AccountSettings from "./settings/AccountSettings";
import PreferenceSettings from "./settings/PreferenceSettings";
import { DialogContent } from "../components/ui/dialog";

const SettingsModal = () => {
  const [activeSection, setActiveSection] = useState("User");
  const [serverUrl, setServerUrl] = useState("");
  const { user, updateProfile } = useAuth();

  const sections = {
    Account: [
      { name: "User", icon: <UserIcon strokeWidth={1} /> },
      { name: "Preferences", icon: <CogIcon strokeWidth={1} /> },
      { name: "Notifications", icon: <BellIcon strokeWidth={1} /> },
    ],
    Workspace: [
      { name: "Appearance", icon: <PaletteIcon strokeWidth={1} /> },
      { name: "Connection", icon: <RefreshCcwIcon strokeWidth={1} /> },
      { name: "People", icon: <UsersIcon strokeWidth={1} /> },
      { name: "Security", icon: <KeyIcon strokeWidth={1} /> },
    ],
  };

  return (
    <DialogContent
      noDefaultWidth
      className="bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--sidebar-border)] rounded-xl shadow-2xl max-w-6xl w-[90vw] h-[80vh] flex p-0 overflow-hidden"
    >
      <div className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] p-4">
        <nav className="space-y-0">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div className="space-y-0.5 mb-4" key={sectionName}>
              <h3 className="text-sm font-bold text-[var(--muted-text)] mb-2">
                {sectionName}
              </h3>
              {items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveSection(item.name)}
                  className={`w-full text-left py-1 px-4 rounded-md flex items-center gap-2 ${
                    activeSection === item.name
                      ? "bg-[var(--active-item)] text-[var(--text-color)]"
                      : "hover:bg-[var(--active-item)]"
                  }`}
                >
                  {item.icon}
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
        <div className="bg-[var(--sidebar-bg)] shadow-lg p-4 rounded-[var(--border-radius)] border border-[var(--sidebar-border)]">
          {activeSection === "User" && (
            <AccountSettings user={user} updateProfile={updateProfile} />
          )}
          {activeSection === "Preferences" && <PreferenceSettings />}
          {activeSection === "Connection" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Server to Connect
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="Enter server URL"
                className="block w-full bg-[var(--bg-color)] border-[var(--sidebar-border)] rounded-md shadow-sm focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] text-[var(--text-color)] sm:text-sm p-2"
              />
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default SettingsModal;