# Cyber Shield – REST API Technical Specification

**Base URL (Local Development)**: `http://localhost:5000/api`  
**Authentication Scheme**: Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)  
**Standard Payload Format**: JSON (`Content-Type: application/json`)

---

## 1. System Health

### `GET /api/health`
Check the operational status, uptime, and engine state.
* **Access**: Public
* **Response `200 OK`**:
```json
{
  "status": "HEALTHY",
  "service": "Cyber Shield Detection Engine",
  "timestamp": "2026-09-12T07:23:39.000Z",
  "uptime": 912
}
```

---

## 2. Authentication & Identity

### `POST /api/auth/register`
Register a new operator account.
* **Rate Limit**: 30 requests / 15 minutes
* **Request Body**:
```json
{
  "name": "Operator Name",
  "email": "operator@cybershield.io",
  "password": "SecurePassword@123"
}
```
* **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid-v4",
    "name": "Operator Name",
    "email": "operator@cybershield.io",
    "role": "USER",
    "createdAt": "2026-09-12T07:00:00.000Z"
  }
}
```

### `POST /api/auth/login`
Authenticate with email and password. Automatically parses User-Agent and records login telemetry.
* **Rate Limit**: 30 requests / 15 minutes
* **Request Body**:
```json
{
  "email": "user@cybershield.io",
  "password": "User@123456"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid-v4",
    "name": "Alex Vance",
    "email": "user@cybershield.io",
    "role": "USER",
    "createdAt": "2026-09-12T06:00:00.000Z"
  }
}
```

### `POST /api/auth/forgot-password`
Request a cryptographically signed password reset token.
* **Request Body**:
```json
{
  "email": "user@cybershield.io"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "If an account exists with this email address, password recovery instructions have been dispatched.",
  "devResetUrl": "/reset-password?token=eyJhbGci...",
  "token": "eyJhbGci..."
}
```

### `POST /api/auth/reset-password`
Establish new password credentials using a valid 15-minute recovery token.
* **Request Body**:
```json
{
  "token": "eyJhbGciOi...",
  "newPassword": "NewPassword@123456"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Your password has been successfully reset. You may now sign in with your new credentials."
}
```

### `GET /api/auth/me`
Retrieve authenticated profile details.
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response `200 OK`**:
```json
{
  "success": true,
  "user": {
    "id": "uuid-v4",
    "name": "Alex Vance",
    "email": "user@cybershield.io",
    "role": "USER",
    "scanCount": 10
  }
}
```

### `PUT /api/auth/profile`
Update user display name or change password.
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body**:
```json
{
  "name": "Alex Vance",
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "user": { "id": "...", "name": "Alex Vance", "email": "..." }
}
```

---

## 3. Threat Detection Engines

### `POST /api/detect/url`
Deep heuristic and Live Threat Grid inspection for URLs.
* **Headers**: Optional `Authorization: Bearer <TOKEN>` (associates scan with user history)
* **Request Body**:
```json
{
  "url": "https://paypa1-security.xyz/login"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "scanId": "scan-uuid",
  "data": {
    "status": "MALICIOUS",
    "riskScore": 100,
    "confidenceScore": 88,
    "riskLevel": "CRITICAL",
    "reasons": [
      "[CRITICAL] Threat Intelligence Grid: CREDENTIAL_HARVESTING: Active zero-day credential harvesting threat signature.",
      "[CRITICAL] Typosquatting Brand Impersonation: Domain 'paypa1' mimics 'paypal'.",
      "[HIGH] High-Risk TLD (.xyz): Frequently associated with disposable phishing campaigns."
    ],
    "signals": [
      {
        "id": "EXTERNAL_THREAT_FEED_MATCH",
        "name": "Threat Intelligence Grid: CREDENTIAL_HARVESTING",
        "severity": "CRITICAL",
        "scoreImpact": 85,
        "description": "Identified by CyberShield Global Threat Grid as active malicious campaign."
      }
    ],
    "recommendation": "DO NOT visit this link or input credentials.",
    "metadata": {
      "domain": "paypa1-security.xyz",
      "threatFeed": {
        "checked": true,
        "provider": "CyberShield Global Threat Grid & PhishTank Verified Feed",
        "matched": true,
        "threatType": "CREDENTIAL_HARVESTING"
      }
    }
  }
}
```

### `POST /api/detect/qr`
Classifies QR payloads (URL, UPI, Wi-Fi, vCard) and routes to appropriate detection engines.
* **Request Body**:
```json
{
  "content": "upi://pay?pa=support.helpdesk@okaxis&pn=Refund&am=5000"
}
```

### `POST /api/detect/otp`
Analyzes social engineering messages and enforces Privacy-by-Design OTP masking.
* **Request Body**:
```json
{
  "message": "Urgent! Account suspended. Share OTP 982341 with executive to verify KYC."
}
```
* **Response Key Highlights**:
  - `maskedInput`: `"Urgent! Account suspended. Share OTP •••••• with executive to verify KYC."`
  - Raw 6-digit code is never stored or returned.

### `POST /api/detect/upi`
Scrutinizes UPI handles, refund lures, and PIN-to-receive traps.
* **Request Body**:
```json
{
  "paymentText": "Enter UPI PIN to receive Rs 4,500 pending cashback."
}
```

---

## 4. Scans & Personal Audit History

### `GET /api/scans`
Query authenticated user's scan history with search and vector filtering.
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Query Parameters**:
  - `type`: `ALL`, `URL`, `QR`, `OTP`, `UPI`, `CHAT`
  - `riskLevel`: `ALL`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`
  - `search`: String query
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 10)

### `GET /api/scans/:id`
Fetch complete technical telemetry report for a specific scan ID.

### `DELETE /api/scans/:id`
Permanently delete an individual scan record from personal history.

### `DELETE /api/scans`
Purge all scans for the authenticated user.

---

## 5. CyberBot AI Assistant

### `POST /api/chat`
Send message to CyberBot AI assistant for cybersecurity advice or embedded threat analysis.
* **Headers**: Optional `Authorization: Bearer <TOKEN>`
* **Request Body**:
```json
{
  "message": "Can you check if http://paypa1-security.xyz is dangerous?"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "reply": "⚠️ **MALICIOUS THREAT DETECTED**\n\nI analyzed the URL `https://paypa1-security.xyz`:\n- **Classification**: MALICIOUS (Risk: 100/100)\n- **Findings**: Typosquatting Brand Impersonation, Disposable TLD...",
  "detectedType": "URL",
  "resultStatus": "MALICIOUS",
  "riskScore": 100,
  "isThreatCheck": true
}
```

---

## 6. Administrative Console (Role: `ADMIN`)

*All admin endpoints require `Authorization: Bearer <TOKEN>` with `role: "ADMIN"`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | High-level telemetry stats, vector counts, recent scans, system health |
| `GET` | `/api/admin/users` | Paginated user accounts directory with search and scan counts |
| `PATCH` | `/api/admin/users/:id/toggle` | Activate or deactivate user access |
| `DELETE` | `/api/admin/users/:id` | Delete user and cascade delete related telemetry |
| `GET` | `/api/admin/scans` | Global telemetry explorer across all users and vectors |
| `DELETE` | `/api/admin/scans/:id` | Purge malicious scan record globally |
| `GET` | `/api/admin/sessions` | Operator login events with IP, client device, browser, timestamps |
| `GET` | `/api/admin/users/:id/activity` | Detailed personal search history and profile stats for an operator |
| `GET` | `/api/admin/analytics` | Risk distribution and threat type breakdowns for charting |
| `GET` | `/api/admin/audit-logs` | Immutable audit log of administrative actions |
