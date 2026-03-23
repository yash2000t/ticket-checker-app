# 🎟️ QR Ticket Management System (PC + Mobile) - Full Instructions

Meka PC ekai Mobile ekai dekama connect wena, Google Sheets backend ekak thiyena system ekak. PC eken data enter karaddi mobile ekata ewa update wenawa.

---

## 🛠 1. Technical Requirements
* **Frontend:** HTML5, Tailwind CSS (Styling), JavaScript (Logic).
* **Storage (Cloud):** Google Sheets (Central Database).
* **Storage (Local/Cache):** Dexie.js (Phone ekedi scan speed eka wadi karanna).
* **QR Scanning:** `html5-qrcode` library (Mobile browser camera use karanna).
* **QR Generation:** `qrcode.js` (Ticket issue karaddi QR code eka hadanna).
* **Hosting:** GitHub Pages hari Netlify (Meka online thiyenna ona phone eken access karanna).

---

## 📊 2. Database Structure (Google Sheets)
Sheet eke nama `Tickets` kiyala danna. Column names tika A idan G wenakan me piliwelata danna:

| Column | Header Name | Description |
| :--- | :--- | :--- |
| A | **Ticket_ID** | Unique code (e.g., TKT-5542) |
| B | **Name** | Customer Name |
| C | **Phone** | Contact Number |
| D | **Email** | Email Address |
| E | **Group** | Category (VIP, Normal, etc.) |
| F | **Status** | Default: `Unused` |
| G | **Timestamp** | Scan karapu welawa (Auto update) |

---

## ⚙️ 3. Backend Setup (Google Apps Script)
1.  Google Sheet eke **Extensions > Apps Script** yanna.
2.  Meke pradanawa function dekayi ona:
    * `doPost(e)`: PC eken ena data Sheet ekata add karanna.
    * `doGet(e)`: Mobile eken request karama ticket valid da kiyala check karanna.
3.  **Deploy:** Click 'Deploy' -> 'New Deployment'.
    * **Type:** Web App.
    * **Execute as:** Me (Oya).
    * **Who has access:** `Anyone`.
4.  Gena **Web App URL** eka copy karaganna (Meka `app.js` ekata ona wenawa).

---

## 💻 4. System Components (The Code)

### A. Admin Panel (PC - `index.html`)
* **Purpose:** Ticket issue kirima.
* **Features:**
    * Input fields: Name, Phone, Email, Group.
    * "Generate Ticket" button: Click kalama random `Ticket_ID` ekak hadila QR code ekak screen eke display wenawa.
    * Data eka Google Sheet ekata submit wenawa.

### B. Scanner Page (Mobile - `scanner.html`)
* **Purpose:** Ticket check kirima.
* **Features:**
    * Mobile camera eka open wenawa.
    * Scan kalama `Ticket_ID` eka local **Dexie.js** cache eke thiyena data ekka match karanawa.
    * Data eka valid nam Google Sheet ekata "Used" kiyala update yawala, screen eka "Success" kiyala green color wenawa.

---

## 🚀 5. Implementation Workflow

### Step 1: Initial Sync
Mobile eken scanner page ekata giya gaman, Google Sheet eke thiyena data tika **Dexie.js** walata download wenna code eka liyanna. Ethakota scan karaddi speed eka godak wadii.

### Step 2: Processing the Scan
```javascript
// Pseudo-code for Scan logic
function onScanSuccess(decodedText) {
    // 1. Check in Dexie.js local DB
    // 2. If 'Unused', send update to Google Apps Script
    // 3. Show Success/Fail UI
}