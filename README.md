<div align="center">

# 🔬 TrustLens AI

### Forensic Product Analysis & Clinical Safety Assistant

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash_%2F_Pro-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-Object_Storage-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/products/r2/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Forensic ingredient analysis, regulatory authenticity verification, and patient-specific health safety evaluation in the palm of your hand.</strong>
</p>

</div>

---

## 📖 Overview

**TrustLens AI** is a mobile-first clinical safety and forensic product verification assistant designed to protect consumers and patients from harmful chemicals, hidden allergens, and counterfeit pharmaceuticals or consumables.

By combining high-resolution visual scanning with **Google Gemini's multimodal clinical intelligence**, official regulatory databases (including **NAFDAC Green Book** registries), and personalized health constraints, TrustLens transforms complex chemical lists and medical jargon into plain-English, actionable safety diagnostics.

---

## ✨ Key Features

- 📸 **Forensic Label & Barcode Scanning**: Capture or upload photos of ingredients, packaging, and regulatory seals. Optical extraction parses chemical compounds, additives, and registration numbers in seconds.
- 🧠 **Google Gemini Multimodal AI Engine**:
  - Deep forensic analysis via **Gemini 2.5 Pro** and **Gemini 2.5 Flash**.
  - Generates numerical Safety Scores ($0 - 100$), classification statuses (*SAFE*, *CAUTION*, *AVOID*), and authentic product probability.
  - Generates comprehensive, clinical-grade medical reports explained in accessible patient language.
- 🛡️ **Regulatory & Authenticity Verification**:
  - Live and offline cross-referencing against the official **NAFDAC (National Agency for Food and Drug Administration and Control)** database.
  - Automatic detection of unregistered products, counterfeit drugs, expired batches, and unapproved imports.
- 🩺 **Personalized Health & Allergen Mapping**:
  - Custom health profile mapping (allergies, hypertension, diabetes, pregnancy/maternal constraints, pediatric needs).
  - Highlights critical contraindications and dangerous chemical triggers specific to the individual.
- 💬 **Ask Clinical AI & Medical Search Grounding**:
  - Conversational AI guide for interactive follow-up questions.
  - Maps and search grounding to locate nearby accredited testing laboratories, certified pharmacies, and emergency poison control resources.
- ☁️ **Dual Cloud & Offline Storage Architecture**:
  - **Local SQLite Cache**: Instant access and offline diagnostics without network dependence.
  - **Google Cloud Firestore**: Encrypted cloud synchronization for user profiles and historical scan records.
  - **Cloudflare R2 Object Storage**: S3-compatible cloud bucket integration with Cloudflare Workers for secure media storage and fast CDN delivery.

---

## 🏗️ Architecture & Tech Stack

```
TrustLens Mobile (Expo / React Native)
│
├── Presentation Layer
│   ├── Expo Router (File-based navigation: /scan, /history, /ask-ai, /profile)
│   ├── Safe Area Context & Fluid Glassmorphic UI (Expo Glass Effect, Linear Gradient)
│   └── Vector Icons (Ionicons / Expo Symbols)
│
├── State & Logic Layer
│   ├── TrustLensContext (Global profile, active scan state, offline/online transitions)
│   └── ProductAnalysisEngine (Offline heuristic diagnostic fallback)
│
├── Cloud & Forensic Services
│   ├── GeminiApiService (Google Gemini 2.5 Pro & 2.5 Flash API client)
│   ├── NafdacService (NAFDAC Green Book verification & search index)
│   ├── FirebaseApiService (Google Cloud Firestore REST integration)
│   └── CloudflareStorageService (Cloudflare R2 S3 uploads & Worker proxy)
│
└── Persistence Layer
    ├── Local Database (SQLite scan history & profile cache)
    └── Cloud Firestore (Encrypted remote sync)
```

| Technology | Purpose |
| :--- | :--- |
| **Expo SDK 57** | Cross-platform mobile runtime & native API bridging |
| **React Native 0.86 & React 19** | Native component architecture & rendering |
| **Expo Router** | Type-safe, deep-linkable, file-based routing |
| **TypeScript** | Strict compile-time typing & schema validation |
| **Google Gemini API** | Multimodal clinical reasoning & report synthesis |
| **Cloudflare R2 & Workers** | High-performance object storage & signed media upload |
| **Google Cloud Firestore** | NoSQL cloud persistence for profiles and scans |
| **NAFDAC Registry** | Official pharmaceutical & consumer product regulatory catalog |

---

## 📁 Repository Structure

```
trustlens/
├── assets/                  # App branding, icons, and splash screens
├── scripts/
│   ├── reset-project.js     # Project initialization script
│   └── sync-nafdac.mjs      # NAFDAC Green Book registry sync & compilation
├── src/
│   ├── app/                 # Expo Router routes & screens
│   │   ├── (tabs)/
│   │   │   ├── index.tsx    # Home dashboard & status overview
│   │   │   ├── scan.tsx     # Camera capture & label scanner
│   │   │   ├── history.tsx  # Historical scan reports & search
│   │   │   └── profile.tsx  # Clinical health profile & security tier
│   │   ├── ask-ai.tsx       # Conversational AI assistant & grounding
│   │   ├── setup/           # Profile onboarding & health conditions wizard
│   │   └── _layout.tsx      # Root navigator layout & provider injection
│   ├── components/          # Reusable UI cards, modals, and badges
│   ├── constants/           # Design system tokens, colors, and layout rules
│   ├── context/             # Global application state (TrustLensContext)
│   ├── data/                # Static data & bundled NAFDAC registry
│   └── services/            # API clients (Gemini, Firebase, Cloudflare, NAFDAC)
├── .env.example             # Template for required environment variables
├── app.json                 # Expo application configuration & metadata
├── eslint.config.js         # ESLint code quality configuration
├── package.json             # Project dependencies & scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0 or newer recommended)
- **npm** or **bun**
- **Expo Go** app on your physical mobile device, or an iOS / Android simulator

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ogbonnaohakwe/trustlens.git
cd trustlens
npm install
```

### 2. Configure Environment Variables

Copy the example environment template:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure your service credentials:

```ini
# Google Gemini API Key (Get yours at https://aistudio.google.com/)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Firestore (Optional - defaults to local offline mode if empty)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=trustlens-ai
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here

# Cloudflare R2 Storage (Optional - for remote scan image storage)
EXPO_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
EXPO_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME=trustlens-scans
EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
EXPO_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN=https://pub-trustlens-scans.r2.dev
EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=https://upload.trustlens.workers.dev
```

> [!IMPORTANT]
> **Security Notice**: Never commit your `.env` file or expose real API keys in version control. The repository's `.gitignore` is pre-configured to exclude all `.env` files except `.env.example`.

### 3. Run the Development Server

Start the Expo bundler:

```bash
npm run start
```

From the terminal interface:
- Press `a` to run on an connected Android device/emulator
- Press `i` to run on an iOS simulator (macOS required)
- Press `w` to open in a web browser
- Or scan the QR code with **Expo Go** on your iOS or Android mobile device.

### 4. Syncing the NAFDAC Database (Optional)

To rebuild or refresh the compiled NAFDAC Green Book registry database:

```bash
npm run sync:nafdac
```

---

## 🔒 Security, Privacy & Clinical Disclaimer

- **Zero Credential Exposure**: Client API keys are injected via environment configurations and never hardcoded in production source files.
- **Data Minimization & Local-First**: Scan analyses can run entirely offline or in local sandbox mode without requiring user data transmission to third parties.
- **Clinical Advisory**: *TrustLens AI* is designed as an educational, informational, and secondary decision-support tool. It is not intended to replace certified medical advice, formal physician consultation, or official laboratory chemical testing. Always consult licensed healthcare professionals for acute medical conditions or medication adjustments.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
