import React from 'react';
import { OnlineStatus } from '../../types';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onlineStatus?: OnlineStatus;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  onlineStatus,
  className = '',
}) => {
  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-semibold',
  };

  const dotSizeClasses = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  const getStatusColor = () => {
    switch (onlineStatus) {
      case 'online':
        return 'bg-emerald-500';
      case 'away':
        return 'bg-amber-500';
      case 'offline':
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-slate-200 shadow-xs`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback to initials on broken image link
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#111111] text-white font-medium flex items-center justify-center border border-[#efefef]`}
        >
          {getInitials(name)}
        </div>
      )}

      {onlineStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${dotSizeClasses[size]} ${getStatusColor()}`}
          title={`Status: ${onlineStatus}`}
        />
      )}
    </div>
  );
};
