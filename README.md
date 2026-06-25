
# Cracklix | Punjab's Mock Test Platform

Punjab's most advanced government exam preparation platform.

## 🚀 Git Sync Commands (Fixes the "Not Pushing" issue)

If `git push` is failing or nothing is happening, run these in the terminal:

### 1. Standard Fix (Safe)
This will fetch remote changes, merge them with your work, and then push.
```bash
npm run git:fix
```

### 2. The Nuclear Option (Use only if #1 fails)
This will overwrite the GitHub version with your local version.
```bash
npm run git:force
```

## 🔐 Git Authentication Fix (GitHub Token)

GitHub no longer accepts your account password for terminal operations. You must use a **Personal Access Token (PAT)**.

1.  **Generate Token**: Go to [GitHub Settings](https://github.com/settings/tokens) > **Generate new token (classic)**.
2.  **Select Scopes**: Check the `repo` box.
3.  **Copy Token**: Copy the generated `ghp_...` string.
4.  **Use Token**: When the terminal asks for your **Password**, paste the **Token** instead.

Alternatively, you can update your remote to include the token (useful for cloud environments):
```bash
git remote set-url origin https://<YOUR_TOKEN>@github.com/arshgrewal1122/cracklix.git
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
   - `CASHFREE_CLIENT_ID`: Your Cashfree App ID.
   - `CASHFREE_CLIENT_SECRET`: Your Cashfree Secret Key.
4. Click **Deploy**.

---
Developed by **Arsh Grewal**
# cracklix
# cracklix
# app
# app
