# MongoDB Atlas Setup Guide

## Current MongoDB URI Format

The application expects a MongoDB URI in this format:

```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

## Steps to Get Your MongoDB Atlas Connection String

### 1. Create/Login to MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up or log in

### 2. Create a Cluster (if you don't have one)
- Click "Build a Database"
- Choose FREE tier (M0)
- Select your preferred cloud provider and region
- Click "Create"

### 3. Create Database User
- Go to "Database Access" in the left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Enter username and password (save these!)
- Set user privileges to "Atlas admin" or "Read and write to any database"
- Click "Add User"

### 4. Whitelist Your IP Address
- Go to "Network Access" in the left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development) or add your specific IP
- Click "Confirm"

### 5. Get Your Connection String
- Go to "Database" in the left sidebar
- Click "Connect" on your cluster
- Choose "Connect your application"
- Select "Node.js" as the driver
- Copy the connection string (it looks like):
  ```
  mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

### 6. Update Your .env File

Replace the `MONGODB_URI` in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fitness-tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

**Important:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Replace `cluster0.xxxxx` with your actual cluster name
- The `/fitness-tracker` part is the database name (you can change it)

### Example:
```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/fitness-tracker?retryWrites=true&w=majority
```

## After Updating .env

1. Restart your backend server:
   ```bash
   cd backend
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. The server should connect to MongoDB Atlas automatically

3. Test the connection by trying to sign up again

## Troubleshooting

- **Connection timeout**: Make sure your IP is whitelisted in Network Access
- **Authentication failed**: Double-check username and password in the connection string
- **Database not found**: The database will be created automatically when you first use it

