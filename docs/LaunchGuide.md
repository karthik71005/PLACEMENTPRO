# Complete Deployment Guide for PlacementPro (Zero to Production)

Congratulations! Sprint 6 is complete, and PlacementPro is ready for production. Since this is your first time deploying a full-stack project of this scale, this guide will take you step-by-step from pushing your code to GitHub all the way to having a live, accessible application.

We will break this down into 3 phases:
1. **Source Control (GitHub)**
2. **Backend Deployment (AWS EC2 & MongoDB Atlas)**
3. **Frontend Deployment (Vercel)**

---

## Phase 1: Pushing Code to GitHub

Before deploying anything, your code needs to be in a Git repository. 

### Step 1.1: Initialize Git and Commit
Open an Administrator terminal and navigate to the project root (`C:\Users\esthe\Desktop\PLACEMENTPRO`).

```bash
git init
git add .
git commit -m "Initial commit: Ready for production deployment"
```

### Step 1.2: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **`+`** icon in the top right and select **New repository**.
3. Name it `PlacementPro`, leave it as **Private** (or Public, your choice), and click **Create repository**.

### Step 1.3: Link and Push
In your terminal, copy the commands GitHub provides for an existing repository. It will look like this:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/PlacementPro.git
git push -u origin main
```
Your code is now safely backed up on GitHub!

---

## Phase 2: Backend Deployment (MongoDB, Pinecone, & AWS EC2)

The backend needs to run 24/7 on a cloud server. We will use an AWS EC2 instance (a virtual machine) running Ubuntu.

### Step 2.1: Cloud Database Setup (MongoDB Atlas & Redis)
You cannot use local MongoDB for production. You need a hosted database.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. Build a **Free Tier** Cluster.
3. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
4. Under **Database Access**, create a user (e.g., username `admin`, password `yourpassword`).
5. Click **Connect** -> **Drivers** and copy the **Connection String URL**. Replace `<password>` with the password you just created.
   * *Example:* `mongodb+srv://admin:yourpassword@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

### Step 2.2: Launch an EC2 Instance (AWS)
1. Go to your [AWS Console](https://aws.amazon.com/) and search for **EC2**.
2. Click **Launch Instance**.
3. **Name:** `PlacementPro-Backend`
4. **OS Image:** Select **Ubuntu 22.04 LTS**.
5. **Instance Type:** `t2.micro` (Free tier eligible).
6. **Key Pair:** Create a new key pair (e.g., `placementpro-key.pem`), download and save it securely. You will need this to log into the server.
7. **Network Settings (Important):**
   * Allow SSH traffic from Anywhere.
   * Allow HTTP traffic from the internet.
   * Allow HTTPS traffic from the internet.
8. Click **Launch Instance**.

### Step 2.3: Connect to your EC2 Instance
1. In the EC2 console, click your running instance and copy the **Public IPv4 address**.
2. Open a terminal on your computer where your downloaded `.pem` file is located.
3. Connect using SSH:
   ```bash
   ssh -i "placementpro-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
   ```

### Step 2.4: Install Docker on EC2
Once inside the EC2 terminal, run these commands to install Docker:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
# Allow your user to run docker without sudo
sudo usermod -aG docker ubuntu
# Log out and log back in for changes to take effect
exit
# Run the SSH command from Step 2.3 again
```

### Step 2.5: Clone Code and Setup Environment Variables
1. Clone your GitHub repository onto the EC2 server:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PlacementPro.git
   cd PlacementPro
   ```
2. Navigate to the backend directory and create your `.env` file:
   ```bash
   cd backend
   nano .env
   ```
3. Paste all your production secrets into this file. It should look like this:
   ```env
   MONGO_URI=mongodb+srv://admin:yourpassword@cluster0...
   MONGO_DB_NAME=placementpro
   ENVIRONMENT=production
   REDIS_URL=redis://redis:6379/0
   GEMINI_API_KEY=your_real_gemini_key
   PINECONE_API_KEY=your_real_pinecone_key
   PINECONE_INDEX_NAME=placementpro-jd
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
   * *Press `Ctrl+O` to save, `Enter` to confirm, and `Ctrl+X` to exit nano.*

### Step 2.6: Run the Backend
Go back to the root folder (where `docker-compose.yml` is) and start the services.
```bash
cd ..
docker-compose up -d --build
```
Your backend is now running! You can test it by putting your EC2's Public IP into your browser: `http://YOUR_EC2_PUBLIC_IP:8000/docs`.

---

## Phase 3: Frontend Deployment (Vercel)

Vercel is the absolute easiest and best way to host Vite/React frontend applications.

### Step 3.1: Vercel Setup
1. Go to [Vercel](https://vercel.com/) and sign up using your GitHub account.
2. Click **Add New** -> **Project**.
3. Vercel will show your GitHub repositories. Find `PlacementPro` and click **Import**.

### Step 3.2: Configure the Frontend
1. **Framework Preset:** Vercel should auto-detect `Vite`.
2. **Root Directory:** Click Edit and select `frontend`.
3. **Environment Variables:** This is crucial. Add all the variables from your local `frontend/.env` file.
   * `VITE_API_BASE_URL`: **http://YOUR_EC2_PUBLIC_IP:8000** (This points your frontend to the EC2 backend you just made).
   * `VITE_FIREBASE_API_KEY`: *Your Firebase Key*
   * `VITE_FIREBASE_AUTH_DOMAIN`: *Your Auth Domain*
   * *Add all other VITE_FIREBASE variables.*
4. Click **Deploy**.

Vercel will build the React app and give you a live URL (e.g., `https://placementpro.vercel.app`). 

---

## Final Review & Next Steps

1. **Update Backend CORS:** Now that you have your Vercel URL, go back to your EC2 server, edit `backend/.env`, and set `ALLOWED_ORIGINS=https://placementpro.vercel.app`. Restart the backend with `docker-compose restart`.
2. **Update Firebase:** Go to your Firebase Console -> Authentication -> Settings -> Authorized domains, and add your new Vercel domain so logins will actually work on the live site.
3. **Custom Domain / HTTPs for Backend:** Right now, your backend is on HTTP (port 8000). Browsers don't like HTTPS frontends talking to HTTP backends. You will eventually need to set up a reverse proxy (like NGINX) and use Certbot for an SSL certificate on your EC2 instance. (Refer to the `docs/DeploymentRunbook.md` file for advanced NGINX setup when you are ready).

**Congratulations! Your full-stack application is live!**
