import React from 'react';



interface UserProfilePictureProps {
  user: {
    username: string;
    profilePicture?: string;
  };
  className?: string;
  [key: string]: any;
}

const UserProfilePicture: React.FC<UserProfilePictureProps> = ({ user, className = '', ...props }) => {
  const firstLetter = user.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <div>
      {user.profilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={`${user.username}'s profile`} 
          className={`rounded-full ${className}`} 
          {...props} 
        />
      ) : (
        <div 
          className={`rounded-full bg-gray-300 flex items-center justify-center text-gray-700 ${className} text-sm w-[1.6em] h-[1.6em]`}
          {...props}
        >
          {firstLetter}
        </div>
      )}
    </div>
  );
};

export default UserProfilePicture;