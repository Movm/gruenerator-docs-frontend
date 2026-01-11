# Grünerator Docs - Collaborative Documentation Frontend

Standalone React frontend for Grünerator's collaborative documentation platform. This app connects to the production Grünerator backend at `https://gruenerator.eu/api` for authentication, document management, and real-time collaboration.

## Features

- ✨ **Real-time Collaborative Editing** - Google Docs-like collaboration using Y.js + Hocuspocus
- 📝 **Rich Text Editor** - TipTap editor with formatting, lists, images, tables, and more
- 📁 **Document Management** - Create, organize, and manage documents with folders
- 👥 **Permissions** - Document-level permissions (owner/editor/viewer)
- 📚 **Version History** - Named snapshots and version tracking
- 🔐 **Keycloak Authentication** - Secure authentication via production backend
- 🎨 **Modern UI** - Clean, responsive interface built with React 18

## Quick Start

### Prerequisites
- Node.js 20+ and npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd gruenerator-docs-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000` and proxy API requests to the production backend.

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Configuration

### Environment Variables

The app uses environment variables to configure backend URLs:

**Development (`.env.development`):**
```bash
# API calls proxied to production
VITE_API_BASE_URL=/api
VITE_API_TARGET=https://gruenerator.eu

# WebSocket connection to production
VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240
```

**Production (`.env.production`):**
```bash
# Direct API calls to production backend
VITE_API_BASE_URL=https://gruenerator.eu/api

# WebSocket connection
VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240
```

## Architecture

### Frontend Stack
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TipTap** - Rich text editor
- **Y.js** - CRDT for collaborative editing
- **Hocuspocus Provider** - WebSocket client for real-time sync
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client

### Backend Integration
This frontend connects to the existing Grünerator backend:

**Authentication:**
- Login: `POST /api/auth/login` → Redirects to Keycloak
- Status: `GET /api/auth/status` → Returns current user
- Logout: `POST /api/auth/logout`

**Documents:**
- List: `GET /api/docs`
- Create: `POST /api/docs`
- Read: `GET /api/docs/:id`
- Update: `PUT /api/docs/:id`
- Delete: `DELETE /api/docs/:id`
- Permissions: `GET/POST /api/docs/:id/permissions`

**Real-time Collaboration:**
- WebSocket: `wss://gruenerator.eu:1240`
- Y.js updates streamed via Hocuspocus

## Development

### Project Structure

```
gruenerator-docs-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── document/       # Document management
│   │   ├── editor/         # TipTap editor components
│   │   ├── permissions/    # Sharing & permissions
│   │   ├── tiptap-node/    # Custom TipTap nodes
│   │   ├── tiptap-ui/      # Editor UI components
│   │   └── version/        # Version history
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   │   └── apiClient.ts    # Axios API client
│   ├── pages/              # Route pages
│   │   ├── HomePage.tsx    # Document list
│   │   ├── EditorPage.tsx  # Document editor
│   │   └── LoginPage.tsx   # Login redirect
│   ├── stores/             # Zustand stores
│   │   ├── authStore.ts    # Authentication state
│   │   ├── documentStore.ts # Document CRUD
│   │   ├── editorStore.ts  # Editor state
│   │   └── aiEditStore.ts  # AI editing features
│   ├── styles/             # CSS styles
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── .env.production         # Production environment
```

### Available Scripts

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript type checking
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Build test
npm run build
```

## Deployment

### Option 1: Netlify (Recommended)

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard:
   ```
   VITE_API_BASE_URL=https://gruenerator.eu/api
   VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240
   ```
4. Deploy!

**SPA Routing:** Netlify automatically handles SPA redirects. For manual setup, create `public/_redirects`:
```
/*  /index.html  200
```

### Option 2: Vercel

1. Import project from GitHub
2. Framework preset: Vite
3. Add environment variables
4. Deploy

### Option 3: Cloudflare Pages

1. Connect repository
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Add environment variables
4. Deploy

### Option 4: Coolify (Self-hosted)

1. **Create new resource** in Coolify
   - Type: Application
   - Source: Public Repository
   - Repository: `https://github.com/Movm/gruenerator-docs-frontend`
   - Branch: `main`

2. **Build configuration**
   - Build Pack: Dockerfile
   - Dockerfile Location: `/Dockerfile` (auto-detected)
   - Port: `80`

3. **Build Arguments** (IMPORTANT - Set in Coolify UI)

   Navigate to: Application → Build → Build Arguments

   Add these build arguments:
   ```
   VITE_API_BASE_URL=https://gruenerator.eu/api
   VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240
   ```

   **Why build arguments?** Vite bakes environment variables into the JavaScript bundle at build time. These must be set as Docker build arguments, not runtime environment variables.

4. **Deploy**
   - Configure domain (e.g., `docs.gruenerator.eu`)
   - Coolify handles HTTPS automatically
   - Deploy!

**Troubleshooting:**
- **Bad Gateway Error:** Ensure build arguments are set (not environment variables)
- **Blank Page:** Check browser console for API URL issues
- **Healthcheck Failures:** The Dockerfile includes a healthcheck; if it fails, check logs

### Option 5: Docker + Nginx (Manual)

The included Dockerfile uses a multi-stage build with default production values.

**Build with custom environment:**
```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://gruenerator.eu/api \
  --build-arg VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240 \
  -t docs-frontend .
```

**Run:**
```bash
docker run -p 8080:80 docs-frontend
```

**Default values:** If no build args are provided, it uses:
- `VITE_API_BASE_URL=https://gruenerator.eu/api`
- `VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240`

## Troubleshooting

### Authentication Issues

**Problem:** Redirects to login but doesn't authenticate

**Solution:** Check that cookies are enabled and the backend URL is correct in `.env`

### WebSocket Connection Failed

**Problem:** Real-time collaboration not working

**Solution:**
1. Verify `VITE_HOCUSPOCUS_URL` in environment variables
2. Check that port 1240 is accessible
3. Ensure WebSocket protocol matches (ws:// for HTTP, wss:// for HTTPS)

### Build Errors

**Problem:** TypeScript errors during build

**Solution:**
```bash
# Check types
npm run typecheck

# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the Grünerator team

---

**Built with ❤️ for the Green Party community**
