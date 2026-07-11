
# Cracklix | Punjab's Mock Test Platform

Punjab's most advanced government exam preparation platform.

## 🚀 First-Time Repository Setup

If you are setting up the repository for the first time, run these commands in the terminal:

```bash
git init
git branch -M main
git remote add origin https://github.com/arshgrewal1/cracklix.git
git add .
git commit -m "Initial commit from Firebase Studio"
git push -u origin main
```

Alternatively, use the automated setup command:
```bash
npm run git:setup
```

## 🔄 Daily Synchronization

To push your latest changes to GitHub after the initial setup:

```bash
npm run git:sync
```

## 🔐 Git Authentication Fix (GitHub Token)

GitHub no longer accepts your account password for terminal operations. You must use a **Personal Access Token (PAT)**.

1.  **Generate Token**: Go to [GitHub Settings](https://github.com/settings/tokens) > **Generate new token (classic)**.
2.  **Select Scopes**: Check the `repo` box.
3.  **Copy Token**: Copy the generated `ghp_...` string.
4.  **Use Token**: When the terminal asks for your **Password**, paste the **Token** instead.

Alternatively, update your remote URL to include the token to avoid repeated prompts:
```bash
git remote set-url origin https://<YOUR_TOKEN>@github.com/arshgrewal1/cracklix.git
```

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Firebase (Auth, Firestore, Storage)

## 🚀 Vercel Deployment
1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Import your GitHub repository (`cracklix`).
3. **Crucial**: Add the following Environment Variables in the Vercel Settings:
   - `GOOGLE_GENAI_API_KEY`: Your Google AI API Key.
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: (From src/firebase/config.ts).
   - `RAZORPAY_KEY_ID`: Your Razorpay App ID.
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret Key.
4. Click **Deploy**.

---
Developed by **Arsh Grewal**
