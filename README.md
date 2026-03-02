# Social DM SaaS

A full-stack social media direct messaging SaaS application built with React, Vite, Express, and MongoDB.

## Features

- Short link management with analytics
- Contact card creation and management
- Lead tracking and management
- Form builder with custom destinations
- Real-time analytics dashboard
- User authentication and authorization

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Deployment:** Netlify (Frontend), Render (Backend)

## Environment Variables

### Frontend (Netlify)

Set these in Netlify's environment variables:

- `VITE_API_BASE_URL` - Backend API URL (defaults to Render URL in production)
  - Production: `https://social-dm-saas.onrender.com/api`
  - Local: `http://localhost:5000/api`

### Backend (Render)

Set these in Render's environment variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (defaults to 5000)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Set up environment variables:**
   - Create `.env.local` in root for frontend
   - Create `.env` in `server/` for backend

3. **Run development servers:**
   ```bash
   # Frontend (root directory)
   npm run dev
   
   # Backend (server directory)
   npm run dev
   ```

## Deployment

### Netlify (Frontend)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://social-dm-saas.onrender.com/api`

### Render (Backend)

1. Create a new Web Service
2. Connect your GitHub repository
3. Set root directory to `server`
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables (MONGODB_URI, JWT_SECRET)

## Image Handling

Images are served from the Render backend. The frontend automatically constructs full URLs using the `getImageUrl()` helper function, which uses the Render backend URL in production.

## Default Admin Credentials

- **Email:** `admin@clickmychat.com`
- **Password:** `admin123`

⚠️ **Important:** Change the default password after first login!
