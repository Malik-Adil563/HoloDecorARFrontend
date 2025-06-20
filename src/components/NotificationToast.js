import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// 👇 Configure Socket.IO server for both environments
const socket = io(
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://ecommerce-for-holo-decor.vercel.app', // must be WebSocket-compatible!
  {
    withCredentials: true,
    transports: ['websocket'], // Ensure websocket transport only (important for Vercel issues)
  }
);

const NotificationToast = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // ✅ Ask permission for browser notification
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // ✅ Listen for real-time notifications
    socket.on('new-notification', data => {
      setNotification(data);
      if (Notification.permission === 'granted') {
        new Notification(data.title, { body: data.message });
      }
    });

    // ✅ Cleanup
    return () => socket.off('new-notification');
  }, []);

  if (!notification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#007bff',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <strong>{notification.title}</strong>
      <p style={{ margin: 0 }}>{notification.message}</p>
    </div>
  );
};

export default NotificationToast;