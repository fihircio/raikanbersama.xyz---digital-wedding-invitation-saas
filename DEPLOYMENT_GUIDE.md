# Deployment Migration Guide (Railway, AWS, Vercel)

This guide will walk you through deploying your `raikanbersama` project to your new Railway account, setting up AWS S3 for file storage, and linking everything together with Vercel for your frontend.

## 1. AWS Setup (File Storage via S3)
Since your backend uses AWS S3 to upload files (gallery images, QR codes, backgrounds), you need an S3 bucket and IAM credentials.

### Step 1.1: Create an S3 Bucket
1. Log in to your [AWS Management Console](https://aws.amazon.com/console/).
2. Search for **S3** and click **Create bucket**.
3. **Bucket name**: e.g., `raikanbersama-uploads` (must be globally unique).
4. **AWS Region**: Select the one closest to your users (e.g., `ap-southeast-1` for Singapore/Malaysia).
5. **Object Ownership**: Leave as "ACLs disabled".
6. **Block Public Access**: Keep "Block all public access" checked (your system uses secure signed URLs so private is perfect).
7. Click **Create bucket**.

### Step 1.2: Create IAM User (for backend access)
1. In the AWS Console, search for **IAM**.
2. Go to **Users** -> **Create user**.
3. Name it e.g., `raikanbersama-backend-user`. Click Next.
4. Select **Attach policies directly** -> click **Create policy** (opens in new tab).
5. Switch to the **JSON** tab and paste the following, replacing `raikanbersama-uploads` with your exact bucket name:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::raikanbersama-uploads",
                "arn:aws:s3:::raikanbersama-uploads/*"
            ]
        }
    ]
}
```
6. Click Next, name the policy `RaikanBersamaS3Policy`, and save it.
7. Go back to your IAM user creation tab, refresh the policy list, select your new `RaikanBersamaS3Policy`, and finish creating the user.
8. Click on your newly created user, go to the **Security credentials** tab, and click **Create access key**.
9. Select **Application running outside AWS**, and click Next -> Create.
10. **IMPORTANT:** Save your **Access Key ID** and **Secret Access Key** securely. You will need these for Railway.

---

## 2. Railway Setup (Backend + Database)
Now we will deploy your Node.js/Express backend to your new Railway account.

### Step 2.1: Initial Project Setup
1. Log in to your new [Railway Account](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `raikanbersama` repository. (If you don't see it, configure the GitHub app to give Railway access).
4. Wait for the initial deployment to fail (it will fail because we haven't set up the database or environment variables yet).

### Step 2.2: Add PostgreSQL Database
1. In your Railway project view, click **Create** (top right) -> **Database** -> **Add PostgreSQL**.
2. Railway will spin up a Postgres database. 
3. Click on the PostgreSQL database block, go to the **Variables** tab, and copy the `DATABASE_URL`.

### Step 2.3: Configure Backend Environment Variables
1. Click on your backend service block in Railway.
2. Go to **Settings** -> scroll down to **Root Directory** and set it to `/backend` (since your backend code is in the `backend/` folder).
3. Go to the **Variables** tab. You need to add all required variables. Click **Raw Editor** and paste the following (update with your actual values):

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-vercel-domain.vercel.app
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info

# Security
JWT_SECRET=generate_a_random_secure_string
JWT_EXPIRES_IN=7d
SESSION_SECRET=generate_another_random_secure_string

# Database Configuration (from Step 2.2)
DATABASE_URL=postgresql://postgres:password@host:port/database

# AWS S3 Configuration (from Step 1)
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=raikanbersama-uploads
S3_ACCESS_KEY_ID=your_aws_access_key
S3_SECRET_ACCESS_KEY=your_aws_secret_key
MAX_FILE_SIZE=5242880
```
4. Click **Update Variables**.
5. Go to **Settings** -> **Networking** -> **Generate Domain**. Note this domain down (e.g., `raikanbersama-backend.up.railway.app`). This is your NEW backend URL.
6. Trigger a re-deploy of your backend service.
7. _Optional but recommended:_ To initialize your DB with seed data, you can temporarily add `npm run seed` as a post-build script in Railway, or run it manually by connecting to the Railway database via a local GUI like DBeaver/TablePlus and running your SQL scripts.

---

## 3. Vercel Setup (Frontend)

Your React/Vite app proxy routes need to be updated to point to the new Railway URL.

### Step 3.1: Update `vercel.json`
Open the `vercel.json` file in the root of your project. Change the `destination` URL to match your new Railway backend domain.

**Before:**
```json
{
    "rewrites": [
        {
            "source": "/api/:match*",
            "destination": "https://raikanbersamaxyz-digital-wedding-invitation-s-production.up.railway.app/api/:match*"
        },
        ...
    ]
}
```

**After:**
```json
{
    "rewrites": [
        {
            "source": "/api/:match*",
            "destination": "https://<YOUR_NEW_RAILWAY_DOMAIN>/api/:match*"
        },
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```

### Step 3.2: Deploy Frontend
1. Commit the `vercel.json` change and push it to GitHub:
   ```bash
   git add vercel.json
   git commit -m "Update API proxy to new Railway deployment"
   git push
   ```
2. If your GitHub is linked to Vercel, this push will automatically trigger a deployment.
3. If not, log in to [Vercel](https://vercel.com/), click **Add New** -> **Project**, select your GitHub repository, ensure the Framework Preset is set to **Vite**, and click **Deploy**.
4. Once deployed, verify that frontend API requests correctly proxy through to your Railway backend without CORS or 502 errors.

---

## Post-Deployment Checklist
- [ ] Ensure database migrations/seeds have been run.
- [ ] Try creating an account or logging in to test the Database connection.
- [ ] Try uploading an image/QR code in the dashboard to test AWS S3 integration.
- [ ] Ensure the live domain is correct on both Vercel (`FRONTEND_URL`) and Railway (`vercel.json`).
