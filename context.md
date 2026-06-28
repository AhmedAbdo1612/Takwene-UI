# TakweneMusic Project Context

This file serves as a comprehensive overview of the `TakweneMusic` codebase state (both Backend API and Frontend UI) to enable quick context loading for subsequent development sessions.

---

## 1. System Overview & Tech Stack
`TakweneMusic` is a track distribution and management system split into a .NET 10.0 Clean Architecture backend API and a Vite + React SPA frontend.

### Backend Tech Stack:
* **Domain & CQRS**: Plain C# entities (Users, Artists, Tracks, DSPs, Distributions) using MediatR for Commands (validations, mutations) and Queries (reads).
* **Identity & JWT**: Handled through ASP.NET Core Identity Core (`IdentityUser<Guid>`) using `UserManager` with refresh token rotation and custom Bearer JWT validation.
* **Minimal APIs & Carter**: Modular minimal endpoints integrated using Carter modules (`ICarterModule`) in `Program.cs`.
* **Database & Persistence**: Entity Framework Core (`AppDbContext`) mapping to PostgreSQL with explicit UTC timezone configurations.
* **Swagger/NSwag**: Generates OpenAPI specifications and includes a JWT authorization wrapper in Swagger UI.
* **API Wrapper Envelopes**: Standardized responses using `ApiResponse<T>`:
  ```json
  {
    "isSuccess": true,
    "message": "...",
    "data": { ... }
  }
  ```

### Frontend Tech Stack:
* **Framework**: React + Vite (ESM environment).
* **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss` for processing utility classes.
* **Animations**: Framer Motion for smooth transitions, slide effects, and layout animations.
* **API / Query Clients**: Axios for requests and `@tanstack/react-query` (TanStack Query) for cache management.

---

## 2. Directory Structure

```text
Track_Management_Front/          # Current Workspace Root
│
├── context.md                    # Project architecture & state summary (this file, locally kept)
│
└── takwene-music-ui/             # React + Vite Frontend Project
    ├── package.json              # Client scripts & package dependencies
    ├── tailwind.config.js        # Core Tailwind theme configuration rules
    ├── postcss.config.js         # PostCSS configuration using @tailwindcss/postcss
    ├── index.html                # App entry with Tailwind classes applied to body and #root
    │
    └── src/
        ├── main.jsx              # App bootstrapper wrapping components in Theme & Query Providers
        ├── App.jsx               # Interactive shell showcasing tabs, mock data, and themes
        ├── App.css               # Empty (cleared of default boilerplate)
        ├── index.css             # Main stylesheet importing Tailwind v4 & defining CSS variables
        │
        ├── context/
        │   └── ThemeContext.jsx  # Context Provider managing dark/light modes and local storage
        │
        ├── api/
        │   ├── axiosClient.js    # Gateway client with JWT rotation queue & envelope unpacking
        │   └── queryClient.js    # TanStack Query Client configurations (defaults, retries)
        │
        └── components/
            ├── Spinner.jsx       # Framer Motion animated loader (inline, fullscreen, size variations)
            └── Skeleton.jsx      # Framer Motion skeleton loaders (card grid, lists, circle text)
```

---

## 3. Frontend Architecture Decisions

### 1. Dual-Theme Variable System
We configured a dual-theme system based on class toggles:
* **Vibrant Light**: Bright, warm lilac-tinted background (`248 247 252`) and clean white cards, with energetic purple accents (`violet-600` primary).
* **Royal Dark**: Deep regal navy/obsidian background (`11 11 26`) and royal card colors (`18 18 38`), with royal purple and indigo highlights (`purple-500` primary).
* **Theme Sync**: [ThemeContext.jsx](file:///C:/Users/Ahmed/Desktop/Track_Management_Front/takwene-music-ui/src/context/ThemeContext.jsx) manages toggling, adds `.dark` class to `document.documentElement`, and syncs user preferences to `localStorage`.

### 2. Axios Request & JWT Rotation Queue
Our API gateway client in [axiosClient.js](file:///C:/Users/Ahmed/Desktop/Track_Management_Front/takwene-music-ui/src/api/axiosClient.js) implements:
* **Global Base URL**: Bound to Render production host `https://takwenemusic.onrender.com/`.
* **Security Origin Guard**: Request interceptor checks config URL before appending authorization keys. JWT headers are attached ONLY to the production domain or local dev servers (`localhost:5023`).
* **Unwrapped Responses**: Automatically parses C# API envelopes, extracting raw `T` data payload directly for queries if `isSuccess` is true.
* **Token Rotation Queue**: Detects expired access keys (`401 Unauthorized`), places pending concurrent requests in a standby queue, acquires new keys using the `/api/auth/refresh` route, and replays all pending requests.

### 3. Reactive UI Loaders
* **Action Button Spinners**: Small inline loaders inside buttons (configured in [Spinner.jsx](file:///C:/Users/Ahmed/Desktop/Track_Management_Front/takwene-music-ui/src/components/Spinner.jsx)) that animate cleanly using Framer Motion and temporarily disable buttons during queries.
* **Skeleton Card Loaders**: Configured in [Skeleton.jsx](file:///C:/Users/Ahmed/Desktop/Track_Management_Front/takwene-music-ui/src/components/Skeleton.jsx). Supports `variant="card"` (cover art, details, footer indicators for tracks) and `variant="list"` (thumbnail, text rows, badges for artists and distribution lists) with smooth pulsing CSS animations.

---

## 4. Current Build & Verification Status
* **Tailwind v4 Integration**: Linked configuration file inside `index.css` via `@config "../tailwind.config.js";` ensuring v4 scans all template files.
* **Vite Production Bundler**: Verified compilation through `npm run build`. Compiles perfectly with **0 warnings and 0 errors**, outputting a CSS footprint of `33.57 KB`.

---

## 5. Next Steps for Frontend Implementation

1. **Routing Setup**:
   * Install `react-router-dom` to transition from simulated tabs to solid routes (e.g. `/`, `/artists`, `/catalog`, `/login`).
2. **Authentication Flow hookup**:
   * Integrate actual login and registration request handlers using `axiosClient` and TanStack Query mutations (`useMutation`).
3. **Database-Driven Pages**:
   * Connect TanStack queries (`useQuery`) to pull live data from the backend's endpoints (`/api/artists`, `/api/tracks`, and `/api/trackdistributions`) to replace mock variables in [App.jsx](file:///C:/Users/Ahmed/Desktop/Track_Management_Front/takwene-music-ui/src/App.jsx).
