import { useAuth } from "./contexts/AuthContext"
import Login from "./components/Login"
import Sidebar from "./components/Sidebar";
import PageEditor from "./components/PageEditor";
import { useEffect, useState } from "react";
import { PageProvider } from "./contexts/PageContext";
import SettingsModal from "./components/SettingsModal";

const App = () => {
  const { user, logout } = useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleZoom = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === ",") {
        event.preventDefault();
        setFontSize((size) => Math.min(size + 2, 32));
      } else if (event.ctrlKey && event.key === "-") {
        event.preventDefault();
        setFontSize((size) => Math.max(size - 2, 12));
      }
    };

    window.addEventListener("keydown", handleZoom);
    return () => window.removeEventListener("keydown", handleZoom);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--global-font-size", `${fontSize}px`);
  }, [fontSize]);

  return user ? (
    <PageProvider>
      <div className="app-container">
        <Sidebar onSettingsClick={() => setIsSettingsOpen(true)} />
        <div className="page-editor">
          <PageEditor />
        </div>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </div>
    </PageProvider>
  ) : (
    <Login />
  );

}

export default App;