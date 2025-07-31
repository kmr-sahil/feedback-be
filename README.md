# TrustFlag.in Backend 🛠️ — Feedback API Server

This is the backend server powering [TrustFlag.in](https://trustflag.in), a platform inspired by Trustpilot for users to submit, browse, and manage reviews for businesses.

The backend is built using **Node.js**, **Express**, and **Prisma ORM** with a **PostgreSQL** database hosted on **Neon**, and integrates services like **AWS S3** for media handling and **SMTP** for transactional emails.

---

## ⚙️ Tech Stack

- Node.js + Express
- PostgreSQL (via Prisma ORM)
- AWS S3 for file uploads
- NeonDB (Postgres hosting)
- SMTP for email
- JWT for auth

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/kmr-sahil/feedback-be.git
cd feedback-be
2. Install Dependencies
bash
Copy
Edit
npm install
3. Create .env File
Create a .env file in the root directory and add the following environment variables:

env
Copy
Edit
DATABASE_URL=your-postgres-db-url
DIRECT_URL=your-direct-postgres-db-url

SECRET_KEY=your-secret-key

AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret
AWS_S3_BUCKET_NAME=your-s3-bucket-name

SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_MAIL=your-smtp-email
SMTP_PASSWORD=your-smtp-password

NODE_ENV=dev
CLIENT_URL=http://localhost:3000
🔐 Replace all values with your actual secrets and credentials. Do not commit .env to GitHub.

🧬 Database Setup (Prisma)
After setting your .env, generate the Prisma client and run migrations:

bash
Copy
Edit
npx prisma generate
npx prisma migrate dev
To view your schema:

bash
Copy
Edit
npx prisma studio
▶️ Running the Dev Server
bash
Copy
Edit
npm run dev
The server will run on http://localhost:8080
Make sure your frontend (CLIENT_URL) is set to http://localhost:3000

📌 API Features
✅ Auth (Register, Login, Google OAuth)

📦 Business & Company endpoints

✍️ Review submission & browsing

📁 AWS S3 image/file upload

📧 SMTP email verification (optional)

🛡️ JWT-based protected routes

🔗 Project Links
Frontend Repo: https://github.com/kmr-sahil/feedback-fe

Backend Repo: https://github.com/kmr-sahil/feedback-be
