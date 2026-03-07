# Deployment Runbook

## 1. Local Production Testing

Before deploying to the cloud (e.g. EC2/Cloud Run), you can run a mock production setup locally.

### Start the Docker Swarm or Compose Network

1. Make sure `.env` variables in `backend/.env` point to your real Mongo Atlas URI and Firebase credentials.
2. Build the backend image and start the cluster:
   ```bash
   docker-compose up --build -d
   ```
3. Test Health:
   `curl http://localhost:8001/health`

## 2. Setting Up an EC2 Instance (Ubuntu 22.04 LTS)

1. SSH into the production server.
2. Install Docker & Docker-Compose:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker
   ```
3. Clone the repo (or securely copy `docker-compose.yml`, `infra/`, and `.env`):
   ```bash
   git clone -b main <repo-url> /opt/placementpro
   cd /opt/placementpro
   ```
4. Define secrets:
   Create `backend/.env` with your production variables:
   ```dotenv
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net
   PINECONE_API_KEY=...
   GEMINI_API_KEY=...
   REDIS_URL=redis://redis:6379/0
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
5. Run the suite:
   ```bash
   docker-compose up -d --build
   ```

## 3. Web Service & NginX Reverse Proxy

If `nginx` is serving as a proxy (setup in `infra/nginx`):
1. Install Certbot for Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```
2. Enable the site config in `/etc/nginx/sites-available/placementpro`:
   ```nginx
   server {
       server_name api.yourdomain.com;
       location / {
           proxy_pass http://localhost:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
3. Generate the SSL Cert:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

## 4. Frontend Deployment (Vercel)

The frontend is automated via GitHub Actions (`.github/workflows/deploy-frontend.yml`).
To deploy manually:
1. `npm i -g vercel`
2. `cd frontend`
3. `vercel --prod`
4. Set all environment variables (`VITE_API_BASE_URL=https://api.yourdomain.com`) in the Vercel dashboard.

## 5. Post-Deployment Checks

- [ ] Firebase allows `api.yourdomain.com` in Auth domains.
- [ ] MongoDB Network is open (or peered) to the EC2 elastic IP.
- [ ] Re-run the test suite from a client against the production API.
- [ ] Ping the `/health` endpoint to ensure MongoDB is "connected".
