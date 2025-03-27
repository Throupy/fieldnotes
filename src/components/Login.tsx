import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = isRegister
      ? await register({username, password, email, profilePic})
      : await login(username, password);

    if (!success) setError("Authentication Failed");
  };

  return (
    <div className="h-screen flex justify-center items-center bg-[rgba(0,0,0,0.5)]">
      <div className="p-8 rounded-lg shadow-lg bg-[var(--bg-color)] border border-[var(--sidebar-border)] max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-color)]">
          {isRegister ? "Create an Account" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
                Email
              </label>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-2 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="file_upload" className="block text-sm font-medium mb-2 text-[var(--text-color)]">
                Profile Picture (optional)
              </label>
              <input
                id="file_upload"
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                className="block w-full text-sm text-[var(--text-color)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-button)] file:text-[var(--text-color)] hover:file:bg-[var(--primary-button-hover)] bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[var(--primary-button)] text-[var(--text-color)] p-3 rounded-md shadow hover:bg-[var(--primary-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-button)] focus:ring-offset-2 transition-all"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[var(--primary-button)] hover:underline text-sm transition-all"
          >
            {isRegister ? "Already have an account? Sign in" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;