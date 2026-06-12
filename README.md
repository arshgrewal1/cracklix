
# Cracklix | Punjab Exam Authority Hub

Punjab's most advanced government exam preparation platform. Designed for aspirants, built with institutional integrity.

## 🚀 Key Features
- **PWA Enabled**: Installable on Android and Desktop for offline practice.
- **High-Fidelity CBT Engine**: Real-time evaluation with bilingual support (EN/PA).
- **Atomic Question Bank**: Growing repository of verified MCQs for PSSSB, PPSC, and Punjab Police.
- **Elite Pass Registry**: Tiered access to premium mocks and AI rationalizations.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Genkit (Logic Rationalization)

## 📦 GitHub Deployment (Trouble-Shooter)

If you encounter errors during `git push`, follow this **Nuclear Fix** sequence:

### 1. The "Refspec Mismatch" or "No Upstream" Fix
If you see "src refspec main does not match" or "has no upstream branch":
```bash
# Stage and commit everything to create a local history
npm run git:sync

# Rename branch to main
git branch -M main

# Set origin and push
git push -u origin main
```

### 2. The "Remote Rejected" Fix
If your push is rejected because the remote contains work you don't have:
```bash
# Pull changes from GitHub and rebase your work on top
git pull --rebase origin main

# Now push
git push origin main
```

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
