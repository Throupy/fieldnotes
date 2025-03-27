import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({ email, username, password, profilePic });
    if (!success) setError('Registration failed');
  };

  return (
    <div className="h-screen flex justify-center items-center bg-[rgba(0,0,0,0.5)]">
      <div className="p-8 rounded-lg shadow-lg bg-[var(--bg-color)] border border-[var(--sidebar-border)] max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-color)]">Register</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              required
              className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Enter your username"
              required
              className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
              className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] placeholder-gray-400 focus:ring-1 focus:ring-[var(--primary-button)] focus:border-[var(--primary-button)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-color)]">
              Profile Picture
            </label>
            <input
              type="file"
              onChange={(e) => setProfilePic(e.target.files?.[0] ?? null)}
              className="w-full p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-button)] file:text-[var(--text-color)] hover:file:bg-[var(--primary-button-hover)] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--primary-button)] text-[var(--text-color)] p-3 rounded-md shadow hover:bg-[var(--primary-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-button)] focus:ring-offset-2 transition-all"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;