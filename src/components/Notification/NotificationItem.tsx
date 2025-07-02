import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error';

export interface MyNotification {
  id: number;
  type: NotificationType;
  message: string;
}

interface NotificationProps {
  notification: MyNotification;
  onClose: (id: number) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const { id, type, message } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      style={{
        marginBottom: 10,
        padding: '10px 20px',
        borderRadius: 5,
        color: type === 'success' ? '#2f855a' : '#c53030',
        backgroundColor: type === 'success' ? '#c6f6d5' : '#fed7d7',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: 250,
      }}
    >
      {message}
    </div>
  );
};

export default NotificationItem