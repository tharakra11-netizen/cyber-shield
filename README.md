# Cyber Shield – Advanced Phishing & Scam Detection System

**Cyber Shield** is a production-style, multi-vector cybersecurity platform designed to detect, analyze, and mitigate digital threats in real time. It features explainable heuristics, social engineering detection, optical QR triage, and financial fraud prevention.

---

## Key Features

### 1. AI Phishing URL Detection
- Normalizes and validates incoming web addresses.
- Multi-vector heuristic detection:
  - Direct IP-based hosts (e.g. `http://192.168.1.1/login`)
  - Character typosquatting and brand lookalikes (e.g. `paypa1`, `micros0ft`, `goog1e`)
  - High-risk and disposable TLDs (`.xyz`, `.top`, `.buzz`, `.work`, etc.)
  - Punycode & IDN homograph impersonation (`xn--...`)
  - Subdomain stacking and credential harvesting paths
  - URL shortener identification (`bit.ly`, `tinyurl.com`, etc.)
- Transparent 0–100 risk scoring with signal-by-signal breakdown and actionable defense recommendations.

### 2. QR Code Multi-Scheme Triage
- Supports drag-and-drop / file upload (PNG, JPG, WebP) and live browser webcam scanning.
- Decodes QR payloads via canvas `jsQR`.
- Safely sandboxes output without automatically executing or navigating to dangerous links.
- Intelligently routes destinations into URL phishing or UPI payment analysis engines.

### 3. OTP Scam & Social Engineering Shield
- Analyzes pasted SMS, WhatsApp, or email notifications for deception.
- **Privacy by Design**: Automatically detects and masks any 4–8 digit verification code (`••••••`) in both the UI and database.
- Detects psychological urgency ("immediately", "within 15 mins"), account suspension threats, utility cutoff lures, and illegal requests to dictate/forward verification codes.
- Reinforces the fundamental rule: *Legitimate banks and services NEVER request OTPs over the phone.*

### 4. UPI Collect & Payment Fraud Detector
- Analyzes UPI handles (VPAs), payment request text, and `upi://pay` URI schemes.
- Detects disguised debit collect-requests, spoofed customer care handles (e.g., `support.bank@okaxis`), and remote access app lures (AnyDesk, TeamViewer).
- Enforces the Golden Rule: *Entering a UPI PIN ALWAYS transfers money OUT of your account; you NEVER enter a PIN to receive money.*

### 5. Audit History & Threat Telemetry
- Personal encrypted audit log for authenticated users with search and filtering by vector and severity.
- Full printable/exportable threat report generator with circular risk gauge and technical metadata.
- User-controlled history deletion ("Purge All" or single-scan removal).

### 6. Administrative Control Console
- Overview of platform threat volume, high-risk flags, and live system health telemetry.
- User identity management: inspect accounts, toggle active/disabled states, delete accounts.
- Global threat scan explorer with search and malicious record purging.
- Statistical analytics: threat severity distribution and vector volume breakdown.
- Administrative audit log capturing all privileged management actions.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, HTML5 Canvas QR Decoder (`jsQR`).
- **Backend**: Node.js, Express, TypeScript, Zod schema validation, Helmet, CORS, Express Rate Limit, Bcrypt, JSON Web Tokens.
- **Database**: Relational SQLite (`dev.db`) managed via Prisma ORM for instant zero-dependency execution on Windows/macOS/Linux, with full PostgreSQL compatibility and `docker-compose.yml`.
- **Security**: Salted bcrypt password hashing, input sanitization, JWT authorization with RBAC (`USER`, `ADMIN`), rate limiting on sensitive routes, and privacy-preserving OTP masking.

---

## Architecture & Project Structure

```
website/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Relational models: User, Scan, AuditLog
│   │   └── seed.ts             # Seeds admin, user, and realistic scans
│   ├── src/
│   │   ├── controllers/        # auth, detect, scan, and admin controllers
│   │   ├── detectors/          # urlDetector, qrDetector, otpDetector, upiDetector
│   │   ├── middleware/         # authMiddleware, rateLimiter, errorMiddleware
│   │   ├── routes/             # auth, detect, scan, admin routes
│   │   ├── utils/              # jwt, prisma client, logger
│   │   └── index.ts            # Server entrypoint
│   ├── tests/
│   │   └── detector.test.ts    # Unit test suite covering all detection engines
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, RiskGauge, StatCard, ScanCard, etc.
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # 19 pages including Home, Scanners, Admin, Dashboard
│   │   ├── services/           # Typed API service client
│   │   ├── types/              # Full TypeScript interface definitions
│   │   ├── App.tsx             # Routing & RBAC guards
│   │   └── main.tsx            # Application mounting
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml          # Containerized PostgreSQL, backend, and frontend
├── .env.example                # Template environment variables
└── README.md
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+) and npm installed.

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```
*Backend will start on `http://localhost:5000`.*

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will start on `http://localhost:5173`.*

---

## Default Seed Credentials

For quick evaluation and demonstration, the database is pre-seeded with two accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cybershield.io` | `Tharak` | Full Admin Console & User Management |
| **Standard User** | `user@cybershield.io` | `User@123456` | Personal Scanner & History Dashboard |

---

## Running Automated Tests

Run the backend detection engine test suite:
```bash
cd backend
npm test
```
Tests evaluate:
- Direct IP hostname flagging (`192.168.1.1`)
- Brand typosquatting and high-risk TLD penalties (`paypa1.xyz`)
- Legitimate clean domain verification
- Urgency-based OTP harvesting SMS detection
- Numeric OTP regex masking (`••••••`)
- UPI PIN-to-receive trap detection
- Spoofed customer care VPA detection
- QR payload classification and routing

---

## Docker Deployment (Optional)

To launch the full stack with containerized PostgreSQL:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## Privacy & Security Compliance

- **No Plaintext Passwords**: Hashed with bcrypt (salt rounds = 10).
- **No Plaintext OTPs**: Regex detection replaces any 4–8 digit verification token before database write.
- **No Banking Secrets Stored**: CVVs, UPI PINs, and passwords are never collected or stored.
- **Input Sanitization**: Zod schema validation guards against injection vulnerabilities.
- **Strict Headers**: `Helmet` sets strict Content-Security and Referrer policies.
