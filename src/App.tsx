import { useAuth } from "./contexts/AuthContext"
import Login from "./components/Login"
import Sidebar from "./components/Sidebar";
import PageEditor from "./components/PageEditor";
import { useEffect, useState } from "react";
import { PageProvider } from "./contexts/PageContext";

const App = () => {
  // will try to get from session, otherwise user null and login displayed
  const { user, authUrl } = useAuth();
  const [authReachable, setAuthReachable] = useState<boolean | null>(null)

  useEffect(() => {

    const checkAuthReachable = async () => {
      try {
        console.log("Checking auth reachability...", authUrl);
        const response = await window.electronAuth.isAuthReachable(authUrl);
        setAuthReachable(response);
      } catch (error) {
        console.error("Error checking auth reachability:", error);
        setAuthReachable(false);
      }
    };

    checkAuthReachable();
  }, [])

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

  console.log(authReachable)

  if (authReachable === false) {
    return <div className="text-center p-8">🚫 Cannot reach authentication server. Please check your connection.</div>;
  }

  if (authReachable === null) {
    return <div className="text-center p-8">⏳ Checking server availability...</div>;
  }

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