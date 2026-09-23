// If you're connecting over USB (adb reverse), run this once alongside the
// existing Metro one:
//   adb reverse tcp:5000 tcp:5000
// Then `localhost` below works from the phone, since adb forwards it to
// your computer.
//
// If you switch to same-WiFi mode instead, replace this with your
// computer's local IP, e.g. 'http://192.168.1.42:5000/api'
// (find it with `ipconfig` on Windows, look for IPv4 Address).
export const API_BASE_URL = 'https://chetab-end.onrender.com/api/';

// Socket.io connects to the server root, not the /api path.
export const SOCKET_URL = 'https://chetab-end.onrender.com';