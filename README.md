# Cracklix | Punjab Exam Authority Hub

Punjab's most advanced government exam preparation platform. Designed for aspirants, built with institutional integrity.

## 🚀 Key Features
- **High-Fidelity CBT Engine**: Real-time evaluation with bilingual support (EN/PA).
- **Atomic Question Bank**: 10,000+ verified MCQs for PSSSB, PPSC, and Punjab Police.
- **Institutional Analytics**: Deep performance audit and state-level ranking.
- **Elite Pass Registry**: Tiered access to premium mocks and AI rationalizations.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State**: Zustand (Exam Store)
- **AI**: Genkit (Logic Rationalization)

## 📦 GitHub Deployment (Correct Sequence)

If you see the message **"nothing to commit, working tree clean"**, it means your work is already saved! Skip to step 3.

```bash
# 1. Stage all files
git add .

# 2. Commit the files (Only if step 1 found new changes)
git commit -m "Initial commit: Production-hardened Cracklix platform"

# 3. Add your remote repository
# If you get an error saying 'remote origin already exists', skip this step.
git remote add origin https://github.com/arshgrewal1122/cracklix.git

# 4. Set branch to main
git branch -M main

# 5. Push and Link to GitHub (Crucial Step)
git push -u origin main
```

## 🚀 Vercel Deployment
1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Import your GitHub repository (`cracklix`).
3. **Crucial**: Add the following Environment Variables in the Vercel Settings:
   - `RAZORPAY_KEY_ID`: Your Razorpay Key.
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret.
   - `GOOGLE_GENAI_API_KEY`: Your Google AI API Key.
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: (And other Firebase config values from src/firebase/config.ts).
4. Click **Deploy**.

---
Developed by **Arsh Grewal**