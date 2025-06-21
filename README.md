# PolicyLens Static Page

A React + Vite application for PolicyLens consultant management system.

## Environment Variables

This project uses environment variables to configure API endpoints for different environments.

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure the environment variables in `.env`:

   **Development (default):**
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_BASE_URL_WS=ws://localhost:8000
   VITE_API_BASE_HOST=localhost:8000
   ```

   **Production:**
   ```env
   VITE_API_BASE_URL=https://backend.prolense.in
   VITE_API_BASE_URL_WS=wss://backend.prolense.in
   VITE_API_BASE_HOST=backend.prolense.in
   ```

### Environment Files

- `.env` - Development environment (not committed to git)
- `.env.production` - Production environment (not committed to git)
- `.env.example` - Example configuration (committed to git)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Available Plugins

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
