import { useState, useEffect } from "react";
import {
  UserIcon,
  PaletteIcon,
  RefreshCcwIcon,
  Settings2Icon,
  BellIcon,
  KeyIcon,
  UsersIcon,
  SquareArrowUpRightIcon,
  HammerIcon,
  CogIcon
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AccountSettings from "./settings/AccountSettings";
import PreferenceSettings from "./settings/PreferenceSettings";
import ConnectionSettings from "./settings/ConnectionSettings";
import { DialogContent } from "../components/ui/dialog";
import PeopleSettings from "./settings/PeopleSettings";
import UserProfilePicture from "./UserProfilePicture";
import GeneralSettings from "./settings/GeneralSettings";

const SettingsModal = () => {
  const [activeSection, setActiveSection] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const { user, updateProfile } = useAuth();

  // first mount set the settings to account setings
  useEffect(() => {
    if (user?.username) {
      setActiveSection(user.username);
    }
  }, [user?.username]);

  const sections = {
    Account: [
      { name: user?.username, icon: <UserProfilePicture user={user} className="w-6 h-6" />,},
      { name: "Preferences", icon: <Settings2Icon strokeWidth={1.5} /> },
      { name: "Notifications", icon: <BellIcon strokeWidth={1.5} /> },
      { name: "Connections", icon: <SquareArrowUpRightIcon strokeWidth={1.5} />, comingSoon: true },
    ],
    Workspace: [
      { name: "General", icon: <CogIcon strokeWidth={1.5} /> },
      { name: "People", icon: <UsersIcon strokeWidth={1.5} /> },
      { name: "Security", icon: <KeyIcon strokeWidth={1.5} /> },
      { name: "Connection", icon: <RefreshCcwIcon strokeWidth={1.5} /> },
    ],
  };

  return (
    <DialogContent
      noDefaultWidth
      className="bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--sidebar-border)] rounded-xl shadow-2xl max-w-6xl w-[90vw] h-[80vh] flex p-0 overflow-hidden"
    >
      <div className="w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] p-1">
        <nav className="space-y-0">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div className="mb-4 space-y-0.5" key={sectionName}>
              <h3 className="px-3 py-2 text-sm font-bold text-[var(--muted-text)]">
                {sectionName}
              </h3>
              {items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveSection(item.name || "Unknown")}
                  className={`p-3 w-full text-left py-1 rounded-md flex items-center gap-2 ${
                  activeSection === item.name
                    ? "bg-[var(--active-item)] text-[var(--text-color)]"
                    : "hover:bg-[var(--active-item)]"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.comingSoon && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
                      Beta
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        {activeSection === user?.username && (
          <AccountSettings user={user} updateProfile={updateProfile} />
        )}
        {activeSection === "Preferences" && <PreferenceSettings />}
        {activeSection === "Connection" && <ConnectionSettings />}
        {activeSection === "People" && <PeopleSettings />}
        {activeSection === "General" && <GeneralSettings />}
        {!["Preferences", "Connection", "People", "General", user?.username].includes(activeSection) && (
            <div className="flex flex-col items-center justify-start mt-20 overflow-hidden">
            <HammerIcon size="64" className=" mb-4" />
            <h2 className="text-xl font-semibold mb-2">Under Construction</h2>
            <p className="text-sm">
              Owen is working hard to bring this feature to you. Stay tuned!
            </p>
            </div>
        )}
      </div>
    </DialogContent>
  );
};

export default SettingsModal;