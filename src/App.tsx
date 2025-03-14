import { useAuth } from "./AuthContext"
import Login from "./Login"
import Sidebar from "./Sidebar";
import PageEditor from "./PageEditor";
import { useEffect, useState } from "react";
import { PageProvider } from "./PageContext";

const App = () => {
  const { user, logout } = useAuth();
  const [fontSize, setFontSize] = useState(18)

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
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty("--global-font-size", `${fontSize}px`);
  }, [fontSize]);

  return (
    <PageProvider>
      <div className="app-container">
        <Sidebar />
        <div className="page-editor">
          <PageEditor />
        </div>
      </div>
    </PageProvider>
  );

  /*
  return user ? (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl">Welcome, {user}! 🎉</h1>
      <button className="mt-4 bg-red-500 text-white p-2 rounded" onClick={logout}>
        Logout
      </button>
    </div>
  ) : (
    <Login />
  );
  */
}

export default App