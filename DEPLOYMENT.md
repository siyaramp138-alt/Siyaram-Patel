# 🚀 SIYA AI Telecaller - Deployment & Launch Guide

This guide provides step-by-step instructions to launch and deploy the **SIYA AI Telecaller** application live on the web for production use.

---

## ⚡ Option 1: Instant 1-Click Launch (Google AI Studio)

If you are currently using **Google AI Studio Build**:

1. Click the **"Share"** or **"Deploy"** button in the top-right header of Google AI Studio.
2. Google AI Studio automatically compiles and deploys your full-stack Node.js + Express + React app on **Google Cloud Run**.
3. You will receive a live production URL (e.g., `https://your-app.run.app`) that can be shared with clients immediately.

---

## 🌐 Option 2: Deploy to Vercel (Recommended)

Vercel provides free, high-performance hosting with full Node.js serverless API support. We have added a pre-configured `vercel.json` file to your project for zero-config deployment.

### Method A: Deploy via Vercel CLI (Command Line)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy with Environment Variable**:
   ```bash
   vercel --env GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

### Method B: Deploy via Vercel Dashboard & GitHub

1. **Push Code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for SIYA AI Telecaller"
   git branch -M main
   git remote add origin https://github.com/your-username/siya-ai-telecaller.git
   git push -u origin main
   ```

2. **Import Project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
   - Import your `siya-ai-telecaller` GitHub repository.

3. **Configure Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**:
   In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*

5. **Deploy**:
   - Click **"Deploy"**. Vercel will auto-detect `vercel.json` and deploy both client UI & `/api/*` backend routes.

---

## 🚆 Option 3: Deploy to Render / Railway / Cloud Run (Full Node.js Server)

Since SIYA includes a lightweight Express backend (`server.ts`) proxying Gemini requests:

### Deploying on Render (render.com)
1. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variable:
   - `GEMINI_API_KEY` = `your_actual_gemini_api_key`
5. Click **Create Web Service**.

---

## ⚡ Option 4: Deploy to Netlify

1. Sign in to [Netlify](https://netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
2. Select GitHub and pick your repository.
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Go to **Site Settings > Environment Variables** and add:
   - `GEMINI_API_KEY`: *Your Gemini Key*
5. Click **Deploy Site**.

---

## 🛠️ Local Development Setup

To run the application on your local machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/siya-ai-telecaller.git
   cd siya-ai-telecaller
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔑 Getting a Google Gemini API Key

1. Go to [Google AI Studio API Key Manager](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy your secret key and paste it into your deployment environment variables (`GEMINI_API_KEY`).
