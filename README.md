# FOOTYZONE Football Streaming Platform

FOOTYZONE is a premium sports Over-The-Top and Video-On-Demand streaming platform engineered specifically for football enthusiasts. It delivers high-fidelity catalog shelves, live video streaming capabilities, individual sub-profile customization, and comprehensive platform analytics for administrative operations.

---

## Key Features

* **Categorized Match Catalog**: Organizes matches into dynamic, sleek shelves representing major tournaments such as the UEFA Champions League, Premier League, La Liga, and the FIFA World Cup.
* **Premium Video Streaming Engine**: Features a high-performance streaming subsystem that leverages direct video streaming.
* **Platform Operations Dashboard**: Provides administrators with live system statistics (total users, active sessions, and catalog size), a match and video uploader, metadata editors, and catalog index listings.
* **Cloudinary Storage Sync**: Automatically synchronizes uploaded assets between the platform database and Cloudinary cloud storage, ensuring reliable asset tracking and rendering.
* **Unified Deletion Protection**: Integrates an administrative deletion tracker to guarantee that once a catalog item or video is removed by an admin, it is permanently kept out of the system and never re-added during automatic server boots.
* **Sub-Profiles Management**: Supports multiple profiles per account, with each profile tracking its own watch history and personalized catalog recommendations.
* **Fan Feedback Review System**: Allows users to post interactive match reviews and star ratings to share opinions with the community.
* **Footyzone Custom Prompts**: Employs elegant, brand-integrated React confirmation modals that present a custom header overlay to prompt users before high-stakes actions like catalog deletions.

---

## Technology Stack

### Frontend Client
* **Framework**: React.js with Vite builder
* **Styling**: Tailwind CSS v4
* **Icons**: Lucide React icons library
* **HTTP Client**: Axios

### Backend Server
* **Environment**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB Atlas and Mongoose ODM
* **Asset Cloud Service**: Cloudinary SDK
* **Real-time Server Comm**: Socket.io

---

## Installation and Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* Node.js (version 18 or above recommended)
* NPM package manager
* A MongoDB connection URI (local instance or MongoDB Atlas cluster)
* A Cloudinary account for media transformations and hosting

### 2. Environment Configurations
Create a `.env` file inside the `server` directory and declare the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_authorization_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Dependencies Installation
Install dependencies for all components by running the following command in the root folder of the project:

```bash
npm run install-all
```

---

## Running the Application Locally

You can launch both the frontend client and backend server concurrently using the pre-configured script in the root directory.

Run the following command at the root workspace:

```bash
npm run dev
```

* **Frontend Client URL**: http://localhost:3000
* **Backend Server URL**: http://localhost:5000

---

## Administrative Credentials

The platform is initialized with a default administrator account. You can log in using:

* **Email Address**: admin@footyzone.com
* **Password**: JJC090354

---

## System Architecture and Mechanics

### 1. Database Seeder
On startup, the system seeder (`server/utils/seeder.js`):
* Connects to the database.
* Syncs the default FOOTYZONE Administrator account.
* Evaluates the match catalog database state.
* Cross-references match titles with the deleted assets list to prevent re-populating items that were deleted by an administrator.

### 2. Deletion Integrity Flow
When an administrator deletes a match or video:
* The item title is stored in the `deleteditems` database collection.
* The video asset is destroyed on Cloudinary using its unique `public_id`.
* The `Video` database record is deleted.
* The corresponding `Match` database record is deleted.
* On subsequent server restarts, the seeder reads from the `deleteditems` collection and skips initializing the deleted title, protecting the administrator's clean catalog.

---

## File Structure

```text
Individual-Project/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable layout and card elements
│   │   ├── contexts/       # AppContext states (watchlist, profile)
│   │   ├── pages/          # Home, Admin, AdminVideos, Profiles, Watch
│   │   └── index.css       # Core stylesheets and design themes
│   └── package.json
├── server/                 # Express backend application
│   ├── config/             # Cloudinary configuration and Mongoose models
│   ├── controllers/        # Auth, Admin, Video, Match controllers
│   ├── routes/             # API routing endpoints
│   ├── utils/              # Seeder, logger, and validation utilities
│   └── server.js           # Server application entry point
├── package.json            # Root workspace script launcher
└── README.md               # Documentation manual
```
