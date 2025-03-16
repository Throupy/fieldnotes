import React, { useState } from "react";
import { FaPaintRoller, FaSync, FaUser } from "react-icons/fa";

const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState("Account");
  const [serverUrl, setServerUrl] = useState("");
  const [fontSize, setFontSize] = useState(16); 
  const [theme, setTheme] = useState("system"); 

  const sections = [
    { name: "Account", icon: <FaUser /> },
    { name: "Appearance", icon: <FaPaintRoller /> },
    { name: "Syncing", icon: <FaSync /> },
  ];

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-[var(--bg-color)] text-[var(--text-color)] border-1 border-[var(--sidebar-border)] rounded-lg shadow-lg w-full max-w-6xl h-[80vh] flex opacity-100">
        <div className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] p-4">
          <h1 className="text-lg font-bold mb-6">Settings</h1>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.name}
                onClick={() => setActiveSection(section.name)}
                className={`w-full text-left py-2 px-4 rounded-md flex items-center gap-2 ${
                  activeSection === section.name
                    ? "bg-[var(--active-item)] text-[var(--text-color)]"
                    : "hover:bg-[var(--active-item)]"
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{activeSection}</h2>
          </div>
          <div className="bg-[var(--sidebar-bg)] p-4 rounded-[var(--border-radius)] border border-[var(--sidebar-border)]">
            {activeSection === "Account" && <p>Account settings will go here.</p>}
            {activeSection === "Appearance" && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="block w-full bg-[var(--bg-color)] border-[var(--sidebar-border)] rounded-md shadow-sm focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] text-[var(--text-color)] sm:text-sm"
                  >
                    {Array.from({ length: (24 - 12) / 2 + 1 }, (_, i) => 12 + i * 2).map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme === "dark"}
                      onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-button)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-button)]"></div>
                    <span className="ml-3 text-sm font-medium">Light</span>
                    <span className="ml-2 text-sm font-medium">Dark</span>
                  </label>
                </div>
              </div>
            )}
            {activeSection === "Syncing" && (
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