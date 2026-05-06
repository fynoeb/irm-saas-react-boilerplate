# IR Manage | Premium Investor Relations Boilerplate

**Developed by funfayct**

IR Manage is a high-performance, enterprise-grade Investor Relations (IR) Management platform. Engineered specifically for startups, fund managers, and venture capital firms, this boilerplate provides a production-ready foundation to streamline the entire fundraising lifecycle—from lead generation to final closing.

---

## Technical Architecture

The platform is architected as a robust Single Page Application (SPA) utilizing a modern full-stack serverless approach to ensure scalability, security, and developer productivity:

- **Frontend Framework**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) for maximum type safety and a predictable development experience.
- **Styling Engine**: [Tailwind CSS](https://tailwindcss.com/) v4, featuring a custom-engineered "Glassmorphism" design system for a premium aesthetic.
- **Real-time Backend**: [Firebase](https://firebase.google.com/) / [Google Cloud Firestore](https://cloud.google.com/firestore) for instant data synchronization and seamless multi-user collaboration.
- **Hardened Security**: Multi-layered [Firestore Security Rules](https://firebase.google.com/docs/rules) implementing strict Attribute-Based Access Control (ABAC) to protect sensitive financial data.

## Core Capabilities

- **Strategic Pipeline Management**: Sophisticated CRM tracking with dynamic stages (Lead, Outreach, Due Diligence, Committed, Closing).
- **Executive Analytics Dashboard**: High-fidelity data visualization via [Recharts](https://recharts.org/) for real-time capital allocation and conversion tracking.
- **Lifecycle Activity Feed**: Automated audit logs tracking every modification to investor profiles and fundraising status.
- **Data Portability**: Integrated CSV export modules for stakeholder reporting and external data analysis.
- **Administrative Control**: Centralized user configuration for profile management and global application settings.

## Optimization & Performance

- **Atomic Architecture**: Highly modular component structure ensuring rapid feature expansion and maintenance.
- **Fluid Geometry**: Fully responsive layout system optimized for high-density desktop dashboards and mobile field access.
- **Motion Orchestration**: Implementation of [Motion](https://motion.dev/) for sub-second visual feedback and professional state transitions.
- **Type-Safe Data Flow**: Comprehensive TypeScript interfaces for all CRM entities, minimizing runtime exceptions.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Firebase Project**: A configured Google Firebase project for database and authentication.

### 1. Environment Setup

Clone the repository and initialize the environment configuration:

```bash
cp .env.example .env
```

Ensure you populate the `.env` file with your specific Firebase and API credentials.

### 2. Dependency Installation

```bash
npm install
```

### 3. Development Server

Launch the development environment with Hot Module Replacement (HMR):

```bash
npm run dev
```

### 4. Production Build

Compile and optimize the application for production deployment:

```bash
npm run build
```

---

## License

Premium License - Proprietary assets and source code. Authorized for commercial use by the purchaser.

*Built with a commitment to architectural integrity and enterprise-standard UI/UX.*
