# Chetá — mobile app

React Native (Expo) app, wired up to the real `cheta-backend` API — auth,
feed, posting (text/photo/video), likes, comments, reposts, notifications,
search, real-time DMs, a full-screen video feed, and a side-drawer menu
with Settings.

## What's here

```
App.tsx                        entry point — gesture-handler import MUST stay first
assets/images/logo.png         the Chetá logo — app icon, splash, favicon, in-app branding
src/
  config/api.ts                the API base URL + Socket.io URL — see "Connecting" below
  services/                    typed functions for every backend endpoint
    apiClient.ts                shared fetch wrapper (auth header, error handling)
    mediaService.ts             multipart upload for picked photos/videos
    socket.ts                   Socket.io connection + live message subscription
    authService.ts, postService.ts, feedService.ts, userService.ts,
    notificationService.ts, searchService.ts, conversationService.ts,
    videoService.ts
    types.ts                    shared API response types
  context/AuthContext.tsx      real login/signup, persists the token on-device,
                                connects/disconnects the socket alongside auth state
  navigation/
    RootNavigator.tsx          Auth vs Main switch, shows the branded loading
                                screen while checking for a saved session
    AuthNavigator.tsx          Login, Signup
    DrawerNavigator.tsx        wraps everything else; the side-drawer menu
    CustomDrawerContent.tsx    drawer's contents — profile header, Settings, Sign out
    MainNavigator.tsx          wraps the tabs + pushes Notifications, PostDetail,
                                NewPost, Conversations, Chat
    TabNavigator.tsx           bottom tabs: Feed, Search, Videos, Profile
  screens/
    auth/LoginScreen.tsx, auth/SignupScreen.tsx     both show the logo
    FeedScreen.tsx              feed, pull-to-refresh, like/repost toggling,
                                compose FAB, header icons: menu (drawer),
                                mail (Conversations), bell (Notifications)
    NewPostScreen.tsx           write a post, optionally attach one photo or
                                video from the library
    SearchScreen.tsx            debounced search across people and posts,
                                inline follow + message buttons on people
    VideoFeedScreen.tsx         full-screen, swipe-to-next video feed
                                (all users' videos, TikTok/Reels-style)
    NotificationsScreen.tsx     real notifications, auto-marks read on open
    ProfileScreen.tsx           real profile + your posts (including reposts)
    PostDetailScreen.tsx        post + comments + comment composer
    ConversationsScreen.tsx     your DM threads, live-updates on new messages
    ChatScreen.tsx              one conversation, real-time send/receive
    SettingsScreen.tsx          account info, sign out, about
  components/
    PostCard.tsx                shared post UI — like, repost, inline photo/video,
                                and a "[Name] reposted" banner when relevant
    InlineVideo.tsx              video player used inside PostCard/NewPostScreen
    FullScreenVideoItem.tsx      one full-screen item in VideoFeedScreen
    BrandedLoadingScreen.tsx     logo + app name, shown while auth state loads
  utils/formatPost.ts          relative time ("3h") + API-to-UI post mapping
  theme/colors.ts              palette pulled from the logo (purple + cream)
```

## Running both halves together

You need **two things running at once**: the backend server and the Expo
dev server.

1. **Start the backend** (in the `cheta-backend` folder):
   ```
   npm run dev
   ```
2. **Connect the phone to both servers over USB** — you already have
   `adb reverse tcp:8081 tcp:8081` set up for Metro; add one more for the API
   (this same port now also carries the Socket.io connection and serves
   uploaded photos/videos, so no third rule is needed):
   ```
   adb reverse tcp:5000 tcp:5000
   ```
   (Run this every time you reconnect the phone — `adb reverse` doesn't
   persist across reboots/unplugs.)
3. **Start the app** (in `cheta-app`):
   ```
   npx expo start
   ```

With both `adb reverse` rules in place, `src/config/api.ts`'s default of
`http://localhost:5000/api` works as-is from the phone, and `SOCKET_URL`
(derived from it automatically) works too.

If you switch to same-WiFi mode instead of USB, change `API_BASE_URL` in
that file to your computer's local IP (e.g. `http://192.168.1.42:5000/api`)
instead — `SOCKET_URL` updates itself accordingly.

## Install dependencies

Several packages were added this round: `expo-image-picker` and
`expo-video` (photo/video attachments + playback), `expo-splash-screen`
(logo branding), `@react-navigation/drawer` +
`react-native-gesture-handler` + `react-native-reanimated` +
`react-native-worklets` (the side-drawer menu). Run:
```
npm install
```
No extra setup needed beyond that — `babel-preset-expo` auto-configures
the Reanimated/Worklets Babel plugin, and `App.tsx` already has the
required `GestureHandlerRootView` wrapper and the gesture-handler import
(which must stay the very first line in that file — don't reorder it).

## Opening screen / branding

Expo Go can't show a custom native splash screen (Expo disabled that
starting SDK 52 — it shows your app icon instead, briefly). So the actual
"opening screen" you'll see while testing is a JS-rendered branded screen
(`BrandedLoadingScreen.tsx`) shown while the app checks for a saved login
session. The native splash is still properly configured in `app.json` for
whenever you make a real build — it'll show correctly then.

## Reposts

Tap the repeat icon on any post to repost it (tap again to undo). A repost
shows up as "[Name] reposted" above the original post's content in
followers' feeds — likes, comments, and further reposts on it all act on
the original post, not the repost wrapper itself.

## DMs

Tap the mail icon on the Feed screen to see your conversations, or tap the
mail icon next to someone in Search to start (or open) a conversation with
them. Messages send over a normal API call and arrive on the other
person's device instantly via Socket.io. The socket connects automatically
whenever you're logged in and disconnects on sign-out.

## Photo & video attachments

On the New Post screen, tap the image icon to attach one photo or video
from your library (max 60 seconds for video). It uploads to the backend
first (`POST /api/media/upload`), then the post is created with the
returned URL. Videos play inline in the feed with native controls.

## Full-screen video feed

The Videos tab is a TikTok/Reels-style vertical feed — swipe up for the
next video. It pulls from **all** users' videos (not just people you
follow), autoplays the video currently on screen (muted by default, tap to
unmute), and pauses everything else. Like/comment/repost work the same as
anywhere else — tapping the comment icon takes you to that post's normal
detail screen.

## Side-drawer menu

Tap the menu icon (top-left of the Feed screen) to open the drawer — shows
your profile, a link to Settings (account info, sign out, about), and a
direct Sign out button.

## What's still not built

- Read receipts, typing indicators, and group DMs (conversations are
  strictly 1:1)
- A "quote repost" (repost + your own added text) — only a plain repost
  exists
- Notification preferences, privacy settings, and other typical Settings
  screen items are placeholders at most — only account info and sign out
  are real right now

## Note on uploaded media

Photos/videos you attach are stored on the backend's local disk
(`cheta-backend/uploads/`), not a cloud service — see that project's
README for what this means if you ever deploy the backend somewhere
permanent.
