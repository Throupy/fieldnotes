import { useAuth } from "./AuthContext"
import Login from "./Login"
import Sidebar from "./Sidebar";
import PageEditor from "./PageEditor";
import { useState } from "react";
import { PageProvider } from "./PageContext";

const App = () => {
  const { user, logout } = useAuth();

  return (
    <PageProvider>
      <div className="app-container">
        <Sidebar />
        <PageEditor />
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