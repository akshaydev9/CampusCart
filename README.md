# CampusCart 🎓

### Buy. Sell. Repeat.

A campus-focused marketplace built to help students buy and sell pre-owned items, discover great deals, and connect directly with other students.

**Built by [Akshay (@akshaydev9)](https://github.com/akshaydev9)**

---

## 🌟 About the Project

CampusCart is a full-stack web application I developed to make student-to-student commerce easier and more accessible. From textbooks and electronics to everyday college supplies, students can create listings, discover items, and communicate with sellers in one place.

The project combines authentication, persistent data storage, image uploads, external API integration, and real-time messaging into a single application.

## ✨ Features

* 🔐 **User Authentication** — Secure registration and login with Firebase Authentication.
* 🛍️ **Marketplace** — Browse listings with search and category filters.
* 📝 **Listing Management** — Create, edit, delete, and mark your listings as sold.
* 🖼️ **Image Uploads** — Upload and optimize images using Cloudinary.
* 📚 **Google Books Integration** — Search for books and retrieve metadata and cover images.
* 💬 **Real-Time Messaging** — Connect buyers and sellers through conversations.
* 🔔 **Unread Message Indicators** — See which conversations have unread messages.
* 🛡️ **Database Security** — Firestore Security Rules enforce listing ownership and conversation access.
* 📱 **Responsive Design** — Clean, modern interface for desktop and mobile.

## 🛠️ Tech Stack

| Technology              | Usage                          |
| ----------------------- | ------------------------------ |
| Next.js                 | Frontend framework and routing |
| TypeScript              | Type-safe development          |
| Tailwind CSS            | UI styling                     |
| Firebase Authentication | User authentication            |
| Cloud Firestore         | Database and real-time updates |
| Cloudinary              | Image hosting and optimization |
| Google Books API        | Book metadata and cover images |
| Git & GitHub            | Version control                |
| Vercel / Netlify        | Deployment                     |

## 🏗️ Architecture

CampusCart follows a serverless architecture.

* **Frontend:** Next.js, React, TypeScript, and Tailwind CSS.
* **Authentication:** Firebase Authentication with protected routes.
* **Database:** Firestore collections for listings and conversations, with messages stored in nested subcollections.
* **Image handling:** Cloudinary uploads and optimized image delivery.
* **External integration:** Google Books API for book search.
* **Authorization:** Firestore Security Rules restrict listing modifications to their owners and conversation access to participants.

## 🚀 Run Locally

### Prerequisites

* Node.js and npm
* A Firebase project
* A Cloudinary account
* A Google Books API key

### 1. Clone the repository

```bash
git clone https://github.com/akshaydev9/CampusCart.git
cd CampusCart/campuscart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the Next.js project directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=
```

Fill in the values from your service dashboards. Never commit `.env.local` to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000.

### 5. Build for production

```bash
npm run build
```

## 🔒 Security

CampusCart uses Firebase Authentication and Firestore Security Rules to enforce access control. Users can modify their own listings, while conversation access is restricted to participating users.

Client-side environment variables prefixed with `NEXT_PUBLIC_` are visible in the browser. Protect access through appropriate Firebase Security Rules and API restrictions, and never place private API secrets in client-side code.

## 💡 What This Project Demonstrates

* Full-stack web application development
* Authentication and authorization
* Database design and CRUD operations
* Real-time data synchronization
* Third-party API integration
* Image upload and optimization
* Responsive UI development
* Version control and deployment workflows

## 👨‍💻 Developer

**Akshay — [@akshaydev9](https://github.com/akshaydev9)**

GitHub: [github.com/akshaydev9](https://github.com/akshaydev9)

---

*CampusCart — Making campus commerce simpler.*

PUBLIC LINK IS campuscart-ebr5z0na3-akshay-686c.vercel.app
