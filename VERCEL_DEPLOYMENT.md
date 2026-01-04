# Vercel Deployment Guide for GymLog

This guide will help you deploy GymLog to Vercel so users can access it live.

## Deployment Strategy

We'll deploy the frontend and backend separately for better performance and scalability:

1. **Backend** → Deploy to Vercel as serverless functions
2. **Frontend** → Deploy to Vercel as a static site

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. MongoDB Atlas account (for production database) or use your local MongoDB URI
3. GitHub repository already set up (you have this!)

## Step 1: Deploy Backend to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **gymlog-backend**
   - Directory? **./** (current directory)
   - Override settings? **No**

6. Add environment variables:
```bash
vercel env add MONGODB_URI
# Paste your MongoDB connection string when prompted
```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `partharor1607/GymLog`
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`

6. Click **"Deploy"**

7. **Copy the deployment URL** (e.g., `https://gymlog-backend.vercel.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import the same GitHub repository: `partharor1607/GymLog`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL from Step 1 (e.g., `https://gymlog-backend.vercel.app`)

6. Click **"Deploy"**

7. **Copy the frontend URL** (e.g., `https://gymlog.vercel.app`)

## Step 3: Update CORS Settings (if needed)

If you get CORS errors, update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

Or allow all origins for development:
```javascript
app.use(cors({
  origin: '*'
}));
```

## Step 4: Seed the Database

After deployment, you need to seed the exercises. You can:

1. Run the seed script locally pointing to your production MongoDB:
```bash
cd backend
MONGODB_URI=your_production_mongodb_uri npm run seed
```

2. Or create a Vercel serverless function to seed the database.

## Environment Variables Summary

### Backend (.env or Vercel Environment Variables)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gymlog
NODE_ENV=production
PORT=5001
```

### Frontend (Vercel Environment Variables)
```
REACT_APP_API_URL=https://gymlog-backend.vercel.app
```

## Testing Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Check if API is working: `https://your-backend.vercel.app/api/health`
3. Test creating a workout
4. Verify exercises are loaded

## Troubleshooting

### Issue: API calls failing
- Check that `REACT_APP_API_URL` is set correctly in frontend
- Verify backend URL is accessible
- Check CORS settings

### Issue: MongoDB connection errors
- Verify `MONGODB_URI` is set in backend environment variables
- Check MongoDB Atlas network access (allow all IPs or add Vercel IPs)
- Ensure database user has proper permissions

### Issue: Build fails
- Check Node.js version (Vercel uses Node 18 by default)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Create a branch → Preview deployment

## Useful Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord

---

**Your live URLs will be:**
- Frontend: `https://gymlog.vercel.app` (or your custom domain)
- Backend: `https://gymlog-backend.vercel.app`

Enjoy your live GymLog application! 💪

