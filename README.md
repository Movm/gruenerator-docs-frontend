# Grünerator Docs - Collaborative Documentation Frontend

Standalone React frontend for Grünerator's collaborative documentation platform. This app connects to the production Grünerator backend at `https://gruenerator.de/api` for authentication, document management, and real-time collaboration.

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
VITE_API_TARGET=https://gruenerator.de

# WebSocket connection to production
VITE_HOCUSPOCUS_URL=wss://gruenerator.de:1240
```

**Production (`.env.production`):**
```bash
# Direct API calls to production backend
VITE_API_BASE_URL=https://gruenerator.de/api

# WebSocket connection
VITE_HOCUSPOCUS_URL=wss://gruenerator.de:1240
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
- WebSocket: `wss://gruenerator.de:1240`
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
   VITE_API_BASE_URL=https://gruenerator.de/api
   VITE_HOCUSPOCUS_URL=wss://gruenerator.de:1240
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

### Option 4: Docker + Nginx

**Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and run:**
```bash
docker build -t docs-frontend .
docker run -p 8080:80 docs-frontend
```

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
