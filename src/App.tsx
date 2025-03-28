import { useAuth } from "./contexts/AuthContext"
import Login from "./components/Login"
import Sidebar from "./components/Sidebar";
import PageEditor from "./components/PageEditor";
import { useEffect, useState } from "react";
import { PageProvider } from "./contexts/PageContext";
import SettingsModal from "./components/SettingsModal";

const App = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleZoom = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      if (e.key === '=') {
        window.electronZoom.zoomIn();
        e.preventDefault();
      } else if (e.key === '-') {
        window.electronZoom.zoomOut();
        e.preventDefault();
      } else if (e.key === '0') {
        window.electronZoom.resetZoom();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleZoom);
    return () => window.removeEventListener('keydown', handleZoom);
  }, []);

  return user ? (
    <PageProvider>
      <div className="app-container">
        <Sidebar/>
        <div className="page-editor">
          <PageEditor />
        </div>
      </div>
    </PageProvider>
  ) : (
    <Login />
  );

}

export default App;