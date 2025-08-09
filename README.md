# Tajeer+ SaaS Platform

**Tajeer+** is a cloud-native SaaS platform designed to modernize and replace the legacy Dynamic desktop application for vehicle rental management in Saudi Arabia.  
It provides **multi-tenant architecture**, deep **integration with Saudi government services**, **IoT connectivity**, **payment processing**, and **AI-powered customer management**, all in compliance with local regulations.

---

## 🚀 Key Features

### 1. Multi-Tenant Architecture
- Isolated tenant environments with dedicated databases.
- Tenant-specific branding, workflows, and business rules.
- Branch and role-based user management.

### 2. Customer Management
- Registration & verification (Nafath integration).
- Loyalty programs and blacklist management.
- Document storage and expiration alerts.

### 3. Vehicle Management
- Vehicle registration with Tamm/Naql verification.
- IoT-based monitoring and predictive maintenance.
- Lifecycle management with depreciation tracking.
- Detailed check-in/out inspection workflows with photo documentation.

### 4. Contract Management
- Digital contract creation & execution (Tajeer integration).
- Digital signatures via Nafath.
- Monitoring for violations, penalties, and extensions.
- Automated closure workflows.

### 5. Government Service Integrations
- **Tamm/Naql** – Traffic violations & compliance.
- **Nafath** – Identity verification & biometric authentication.
- **ZATCA** – VAT-compliant invoicing.
- **Tajeer** – Rental contract registration.
- **Absher** – License and registration validation.

### 6. Payment & Billing
- VAT-compliant invoicing.
- SADAD & Mada payment gateway integration.
- Payment reconciliation, deposits, and refunds.
- Financial dashboards & reports.

### 7. Reporting & Analytics
- Real-time dashboards.
- Operational, compliance, and financial reports.
- Custom analytics and forecasting.

### 8. Administration & Configuration
- System-wide and tenant-level configuration.
- Integration management.
- Security policy customization and auditing.

---

## 🏗 Architecture Overview

- **Cloud-native** deployment (Oracle/GCP).
- **Microservices**-based backend with API Gateway.
- **Database-per-tenant** model for data isolation.
- Secure API integrations with government and payment services.
- Mobile and web client applications.

---

## 📱 Client Platforms
- **Web**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS 14+ & Android 10+
- **Responsive** design with Arabic & English support.

---

## 🔐 Security & Compliance
- TLS 1.2+ encryption for all communications.
- Data encryption at rest & in transit.
- Multi-factor authentication (MFA).
- Compliance with Saudi **Data Protection Regulations**, **ZATCA e-invoicing**, and **Transport Authority** rules.

---

## 📦 Technology Stack
- **Backend**: Node.js (Microservices, API Gateway)
- **Frontend**: React / Angular (Responsive Web App)
- **Mobile**: React Native
- **Database**: PostgreSQL (Per-tenant model)
- **Deployment**: Kubernetes on Oracle Cloud or GCP
- **Integrations**: REST APIs (Gov Services, Payments, IoT)

---

## 📂 Repository Structure (Proposed)
```
/docs               → Documentation & API references
/frontend           → Web application source code
/mobile             → Mobile app source code
/backend            → Backend microservices
/integrations       → External API integration modules
/config             → Configurations & environment setup
/tests              → Automated tests
```

---

## 🛠 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EntangledSolutions-tech/Tajeer-plus.git
   cd tajeer-plus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (example `.env`)
   ```env
   NODE_ENV=development
   DATABASE_URL=...
   GOV_API_KEYS=...
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Web: `http://localhost:3000`
   - API Docs: `http://localhost:3000/api/docs`

---

## 📜 License
This project is licensed under **Proprietary License** – All rights reserved.  
Unauthorized use, distribution, or reproduction is strictly prohibited.
