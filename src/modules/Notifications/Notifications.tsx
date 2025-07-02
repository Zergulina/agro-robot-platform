import React from 'react';
import NotificationItem, { MyNotification } from '../../components/Notification/NotificationItem';

type NotificationsProps = {
  notifications: MyNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<MyNotification[]>>;
}

export const Notifications: React.FC<NotificationsProps> = ({notifications, setNotifications}) => {
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};