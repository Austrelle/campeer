# 🎓 CAMPEER — Setup Guide

## Campus Academic Marketplace for Peer Exchange and Earning Resources

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd campeer
npm install
```

### Step 2: Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g., `campeer-jrmsu`)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in production mode
5. Go to **Project Settings** → **Your Apps** → Add Web App
6. Copy your config values

### Step 3: Configure Firebase Credentials
Open `src/firebase.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Set Firestore Security Rules
1. Go to Firebase Console → Firestore → Rules
2. Copy contents of `firestore.rules` and paste → Publish

### Step 5: Create Admin Account
1. Start the app: `npm run dev`
2. Register a new account normally
3. Go to Firebase Console → Firestore → `users` collection
4. Find your user document
5. Manually set:
   - `isApproved: true`
   - `role: "admin"`
6. Now you can log in and approve/manage other users!

### Step 6: Run Development Server
```bash
npm run dev
```
Visit: `http://localhost:5173`

---

## 📁 Project Structure

```
campeer/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx         # Login form with CAMPEER branding
│   │   ├── RegisterPage.tsx      # 3-step registration form
│   │   ├── PendingPage.tsx       # Waiting for approval screen
│   │   ├── HomePage.tsx          # Dashboard with stats & recent tasks
│   │   ├── TaskFeedPage.tsx      # Browse/claim tasks marketplace
│   │   ├── PostTaskPage.tsx      # Create new task posting
│   │   ├── ProfilePage.tsx       # View & edit student profile
│   │   ├── AboutPage.tsx         # About the system & team
│   │   ├── FeedbackPage.tsx      # Submit feedback/reports
│   │   └── AdminDashboard.tsx    # Admin management panel
│   ├── components/
│   │   └── Layout.tsx            # Navigation + footer wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx       # Firebase auth state management
│   ├── utils/
│   │   ├── constants.ts          # Departments, courses, campuses
│   │   └── crypto.ts             # Contact info obfuscation
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── firebase.ts               # ⚠️ PUT YOUR FIREBASE CONFIG HERE
│   ├── App.tsx                   # Routes & auth guards
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + custom styles
├── firestore.rules               # Firebase security rules
└── package.json
```

---

## 👥 Adding Team Photos (About Page)

Open `src/pages/AboutPage.tsx` and find the `creators` array.

Replace `image: null` with your image path:
```typescript
{
  name: 'Austrelle',
  image: '/team/austrelle.jpg',  // Put photos in public/team/
  ...
}
```

Place photos in the `public/team/` folder.

---

## 🔐 Approval Flow

1. Student registers → `isApproved: false` in Firestore
2. Admin sees them in **Admin Dashboard → Pending Users**
3. Admin clicks **Approve** → `isApproved: true` + notification sent
4. Student can now log in and access marketplace
5. Admin can **Revoke & Delete** any approved user at any time

---

## 📊 Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Student profiles & approval status |
| `tasks` | Posted academic tasks |
| `feedbacks` | Student suggestions & reports |
| `notifications` | Real-time user notifications |

---

## 🎨 Tech Stack

- **React 18** + TypeScript
- **Firebase** (Auth + Firestore)
- **Tailwind CSS** (Glassmorphism)
- **React Router v6**
- **Vite** (build tool)
- **Lucide React** (icons)

---

## 📱 Mobile Responsive

CAMPEER is fully responsive for:
- ✅ Mobile phones (320px+)
- ✅ Tablets (768px+)
- ✅ Laptops/Desktops (1024px+)

---

Built with 💙 for JRMSU Students by **Austrelle**, **Xeena**, and **Forge**
