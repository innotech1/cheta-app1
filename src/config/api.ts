// For a standalone build (EAS Build / installed APK), the app has no dev
// tunnel or USB connection — it needs a real, public backend URL.
// This points at the Render deployment:
export const API_BASE_URL = 'https://chetab-end.onrender.com/api';

// For local development in Expo Go instead, comment the line above and
// uncomment ONE of these:
//
// USB (adb reverse tcp:5000 tcp:5000):
// export const API_BASE_URL = 'http://localhost:5000/api';
//
// Same WiFi network (replace with your computer's local IP from `ipconfig`):
// export const API_BASE_URL = 'http://192.168.1.42:5000/api';

// Socket.io connects to the server root, not the /api path.
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
