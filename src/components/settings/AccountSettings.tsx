import React from "react";

interface UserSettingsProps {
  user: string | null;
}

const UserSettings: React.FC<UserSettingsProps> = ({ user }) => {

  if (user === null) {
    return <p>You are not logged in</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl">
            {user.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-[var(--text-color)]">
              Preferred name
            </label>
            <input
              type="text"
              value={user}
              readOnly
              className="w-full p-2 bg-[var(--bg-color)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] sm:text-sm"
            />
            <button className="text-blue-500 text-sm mt-1 hover:underline">
              Create your portrait
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Account security</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-color)]">Email</p>
              <p className="text-sm text-[var(--muted-text)]">{`${user.toLowerCase()}@gmail.com`}</p>
            </div>
            <button className="bg-[var(--bg-color)] border border-[var(--sidebar-border)] text-[var(--text-color)] py-1 px-3 rounded-md text-sm">
              Change email
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-color)]">Password</p>
              <p className="text-sm text-[var(--muted-text)]">
                Change your password to login to your account.
              </p>
            </div>
            <button className="bg-[var(--bg-color)] border border-[var(--sidebar-border)] text-[var(--text-color)] py-1 px-3 rounded-md text-sm">
              Change password
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-color)]">2-step verification</p>
              <p className="text-sm text-[var(--muted-text)]">
                Turn on 2-step verification to enhance your account security.
              </p>
            </div>
            <button className="bg-[var(--bg-color)] border border-[var(--sidebar-border)] text-[var(--text-color)] py-1 px-3 rounded-md text-sm">
              Change verification methods
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;