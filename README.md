# Service Workers Joke App 🎭

A React + TypeScript + Vite application demonstrating advanced Service Worker capabilities including **Background Sync**, **Push Notifications**, and **Offline Support** through an interactive joke application.

## 🚀 Features

- **Automatic Joke Fetching**: Fetches jokes automatically when online and stores them offline
- **Background Sync**: Queues joke requests when offline and executes them when connectivity is restored
- **Push Notifications**: Shows joke punchlines as push notifications with interactive actions
- **Offline Support**: Full offline functionality with IndexedDB storage
- **Progressive Enhancement**: Works seamlessly across online/offline states

## 🏗️ Architecture

### Service Worker Capabilities

- **Caching Strategy**: Intelligent caching for offline functionality
- **Background Sync**: Handles joke fetching when connection is restored
- **Push Notifications**: Interactive notifications with action buttons
- **IndexedDB Integration**: Persistent storage for jokes with setup/punchline separation

### Component Structure

```
src/
├── pages/Jokes/                 # Main jokes page
│   ├── index.tsx               # Jokes page container
│   └── components/
│       ├── JokeShow.tsx        # Displays joke setup from storage
│       └── JokeActions.tsx     # Fetch jokes & trigger notifications
├── store/jokes.ts              # Zustand state management
└── @types/sw.d.ts             # Service Worker type definitions
```

## 🎯 Component Responsibilities

### **JokeShow Component**

- Retrieves stored jokes from Service Worker
- Displays the joke **setup** (question part)
- Handles loading states and error messages
- Uses MessageChannel for Service Worker communication

### **JokeActions Component**

- **Automatic fetching**: Fetches jokes when online (independent of user clicks)
- **Manual fetch button**: Allows user-triggered joke fetching
- **Notification trigger**: Shows joke punchline as push notification
- **Online/offline status**: Visual indicators for connection state

### **Service Worker (`joke-worker.js`)**

- **Background Sync**: `fetch-joke` event for offline request queuing
- **IndexedDB Storage**: Stores jokes as objects with `{setup, punchline}` structure
- **Message Handling**:
  - `GET_JOKE`: Returns joke setup to client
  - `STORE_JOKE`: Saves jokes directly from client
  - `SHOW_JOKE_NOTIFICATION`: Displays punchline notifications
- **Push Notifications**: Interactive notifications with "Close" and "Get New Joke" actions

## 🔄 User Flow

1. **Initial Load**: App automatically requests notification permissions
2. **Auto-Fetch**: Jokes are fetched automatically when online and stored in IndexedDB
3. **Offline Support**: When offline, joke requests are queued via Background Sync
4. **View Jokes**: Click "Show Joke Setup" to see the joke question
5. **Get Answer**: Click "Show Joke Answer" to receive push notification with punchline
6. **Interactive Notifications**: Notification actions allow closing or fetching new jokes

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Service Worker**: Custom implementation with IndexedDB
- **API**: [Official Joke API](https://official-joke-api.appspot.com/)

## 📱 Service Worker Features Demonstrated

### 1. **Background Sync Handler**

```javascript
// Fetches jokes when connectivity is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'fetch-joke') {
    event.waitUntil(fetchAndStoreJoke());
  }
});
```

### 2. **Push Handler**

```javascript
// Shows joke punchlines as notifications
self.addEventListener('push', (event) => {
  // Retrieves stored joke and shows punchline
  event.waitUntil(showJokeNotification());
});
```

### 3. **IndexedDB Storage**

- Persistent joke storage with setup/punchline separation
- Offline-first architecture
- Automatic data synchronization

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Service Workers Comparison

The project includes detailed documentation comparing different worker types:

| Worker Type    | Scope       | Shared Across Tabs | Persists After Close |
| -------------- | ----------- | ------------------ | -------------------- |
| Web Worker     | Single tab  | No                 | No                   |
| Shared Worker  | Same origin | Yes                | No                   |
| Service Worker | Site-wide   | Yes                | Yes                  |

## 🎯 Learning Objectives

This project demonstrates:

- **Progressive Web App (PWA)** patterns
- **Offline-first** development strategies
- **Background synchronization** techniques
- **Push notification** implementation
- **IndexedDB** for client-side storage
- **Service Worker** lifecycle management

## 📚 References

- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
