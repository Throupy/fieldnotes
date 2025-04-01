import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  workspaceId: string;
  error?: string | null;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSubmit, workspaceId, error }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!username.trim()) return;
    setLoading(true);
    await onSubmit(username);
    setLoading(false);
    if (!error) {
      setUsername('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--sidebar-bg)] shadow-lg border-0 rounded-xl p-0 max-w-md w-full [&>button]:hidden">
        <DialogTitle className="hidden" />
        <div className="p-4">
          <p className="text-base font-medium mb-2">
            Invite user to <span className="font-semibold">{workspaceId.split('_').slice(2).join(' ')}</span>
          </p>

          <input
            type="text"
            placeholder="Enter username"
            className="w-full bg-[var(--active-item)] rounded-md px-3 py-2 text-sm focus:outline-none mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}

          <button
            className="w-full bg-[var(--active-item)] hover:bg-[var(--hovered-item)] transition-all text-sm py-2 px-4 rounded-md disabled:opacity-50"
            onClick={handleInvite}
            disabled={loading}
          >
            {loading ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;