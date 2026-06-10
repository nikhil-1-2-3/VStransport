export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const triggerSystemNotification = (title: string, options?: NotificationOptions) => {
  // 1. Trigger Physical Phone Vibration
  if (navigator.vibrate) {
    // Vibrate pattern: buzz 500ms, pause 250ms, buzz 500ms
    navigator.vibrate([500, 250, 500]);
  }

  // 2. Trigger OS-level Notification Banner
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/vite.svg', // Assuming a standard vite logo is in public, or any icon
        vibrate: [500, 250, 500],
        ...options
      } as any);

      // Automatically close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (e) {
      console.error('Failed to trigger notification', e);
    }
  } else {
    console.log('Notification permission not granted, skipped push alert.');
  }
};
