# Plant Doctor — Setup & Deploy

## Step 1 — Unzip and open terminal in the folder
```
cd plant-doctor
```

## Step 2 — Install dependencies
```
npm install
```

## Step 3 — Test locally
```
npm run dev
```
Open http://localhost:5173 in your browser.

---

## Step 4 — Push to GitHub
Create a new repo on github.com (call it `plant-doctor`), then run:
```
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/plant-doctor.git
git push -u origin main
```

## Step 5 — Deploy on Vercel
1. Go to vercel.com → Add New Project → Import your GitHub repo
2. Go to Settings → Environment Variables
3. Add: `GEMINI_API_KEY` = your key from aistudio.google.com
4. Click Deploy

Done. You get a live URL like `plant-doctor.vercel.app`.

---

## Step 6 — Set your Ko-fi link
In `src/pages/App.jsx` line 28, replace:
```
const KOFI_URL = "https://ko-fi.com/YOUR_KOFI_USERNAME";
```
with your actual Ko-fi URL, then push again:
```
git add .
git commit -m "add kofi link"
git push
```
Vercel redeploys automatically.
