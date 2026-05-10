# Deployment Guide (Railway & Vercel)

## Backend (Railway)
1. Set up a project in Railway.app linked to this repository.
2. Configure the following environment variables:
   - `PORT=8080`
   - `MONGO_URI`
   - `REDIS_URL`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `GEMINI_API_KEY` (or OPENAI_API_KEY)
   - `JWT_SECRET`
3. Add a second service in Railway pointing to the same repository.
4. Set the Start Command for the second service to: `npm run worker`
5. Deploy.

## Frontend (Vercel)
1. Import the repository in Vercel.
2. Select the `frontend` directory as the Root Directory.
3. Set the Environment Variable:
   - `VITE_API_BASE=https://your-rag-api.up.railway.app/api`
4. Deploy.
