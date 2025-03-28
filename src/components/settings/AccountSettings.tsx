import React, { useState } from "react";
import UserProfilePicture from "../UserProfilePicture";

interface AccountSettingsProps {
  user: string | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, updateProfile }) => {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (user === null) {
    return <p>You are not logged in</p>;
  }

  // iamge click -> update pfp
  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const success = await updateProfile({ profilePic: file });
        if (!success) {
          // TODO: toast or something
          console.error('Failed to update profile picture');
        }
      }
    };
    input.click();
  };

  const handleEmailUpdate = async () => {
    if (newEmail) {
      setEmailError(null);
      const success = await updateProfile({ email: newEmail });
      if (success) {
        setShowEmailModal(false);
        setNewEmail("");
      } else {
        setEmailError("Failed to update email");
      }
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword && currentPassword) {
      setPasswordError(null);
      const success = await updateProfile({ 
        password: newPassword, 
        currentPassword 
      });
      if (success) {
        setShowPasswordModal(false);
        setNewPassword("");
        setCurrentPassword("");
      } else {
        setPasswordError("Failed to update password");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center  text-2xl cursor-pointer"
            onClick={handleImageClick}
          >
            <UserProfilePicture user={user} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-[var(--text-color)]">
              Preferred name
            </label>
            <input
              type="text"
              value={user.username}
              readOnly
              className="w-full p-2 bg-[var(--bg-color)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Account security</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-color)]">Email</p>
              <p className="text-sm text-[var(--muted-text)]">{user.email}</p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="bg-[var(--bg-color)] shadow-md border border-[var(--sidebar-border)] text-[var(--text-color)] py-1 px-3 rounded-md text-sm"
            >
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
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="bg-[var(--bg-color)] shadow-md border border-[var(--sidebar-border)] text-[var(--text-color)] py-1 px-3 rounded-md text-sm"
            >
              Change password
            </button>
          </div>
        </div>
      </div>
      <div>
        {showEmailModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
            <div className="bg-[var(--bg-color)] p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Change Email</h3>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
                placeholder="New email"
              />
              {emailError && (
                <p className="text-red-500 text-sm mb-4">{emailError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailError(null);
                  }} 
                  className="px-4 py-2"
                >
                  Cancel
                </button>
                <button onClick={handleEmailUpdate} className="px-4 py-2 bg-blue-500 rounded-md">Save</button>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
            <div className="bg-[var(--bg-color)] p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
                placeholder="Current password"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
                placeholder="New password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mb-4">{passwordError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError(null);
                  }} 
                  className="px-4 py-2"
                >
                  Cancel
                </button>
                <button onClick={handlePasswordUpdate} className="px-4 py-2 bg-blue-500 rounded-md">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;