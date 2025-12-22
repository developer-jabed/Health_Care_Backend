# 🏥 HealthCare Backend - Telemedicine Platform

<div align="center">

![HealthCare Banner](https://img.shields.io/badge/HealthCare-Telemedicine-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-black?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.0-purple?style=flat-square&logo=prisma)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=flat-square&logo=stripe)

**A comprehensive healthcare management system with telemedicine capabilities**

[![Live API](https://img.shields.io/badge/Live_API-Active-brightgreen?style=for-the-badge)](https://health-care-backend-o0cj.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/developer-jabed/Health_Care_Backend.git)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>


## 📋 Table of Contents
- [🏥 HealthCare Backend - Telemedicine Platform](#-healthcare-backend---telemedicine-platform)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
    - [👨‍⚕️ **Patient Portal**](#️-patient-portal)
    - [🩺 **Doctor Portal**](#-doctor-portal)
    - [👑 **Admin Dashboard**](#-admin-dashboard)
  - [🚀 Tech Stack](#-tech-stack)
    - [**Backend Core**](#backend-core)
    - [**Database \& ORM**](#database--orm)
    - [**Authentication \& Security**](#authentication--security)
    - [**External Services**](#external-services)
  - [🏗 Architecture](#-architecture)

---

## ✨ Features

### 👨‍⚕️ **Patient Portal**
- ✅ **Secure Registration & Authentication** with JWT tokens
- ✅ **Personalized Dashboard** with health metrics visualization
- ✅ **Health Records Management** - Track and monitor health progress
- ✅ **Appointment Booking** - Schedule consultations with doctors
- ✅ **Live Video Consultations** - HD video calling with WebRTC
- ✅ **Prescription Management** - Digital prescriptions and refill tracking
- ✅ **Review & Rating System** - Rate healthcare providers
- ✅ **Payment Integration** - Secure payments via Stripe
- ✅ **Real-time Notifications** - Appointment reminders and updates

### 🩺 **Doctor Portal**
- ✅ **Doctor Profile Management** - Complete professional profile
- ✅ **Appointment Calendar** - Manage consultation schedule
- ✅ **Patient Records Access** - View patient health history
- ✅ **Video Consultation Room** - Conduct virtual appointments
- ✅ **Digital Prescription Writing** - Generate and send prescriptions
- ✅ **Availability Management** - Set working hours and slots
- ✅ **Earnings Dashboard** - Track consultations and payments

### 👑 **Admin Dashboard**
- ✅ **User Management** - Manage patients, doctors, and staff
- ✅ **Appointment Monitoring** - Oversee all consultations
- ✅ **Analytics & Reports** - Platform insights and usage statistics
- ✅ **Revenue Management** - Financial reports and payout tracking
- ✅ **Content Management** - Manage medical content and resources

---

## 🚀 Tech Stack

<div align="center">

### **Backend Core**
| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white) | Runtime Environment | 18.x |
| ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) | Web Framework | 4.18.x |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | Language Superset | 5.x |
| ![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white) | Package Manager | 8.x |

### **Database & ORM**
| Technology | Purpose | Version |
|------------|---------|---------|
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) | Primary Database | 15.x |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white) | ORM & Migrations | 5.x |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) | Caching & Sessions | 7.x |

### **Authentication & Security**
| Technology | Purpose | Version |
|------------|---------|---------|
| ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) | Token Authentication | 9.x |
| ![bcrypt](https://img.shields.io/badge/bcrypt-0033A0?logo=security&logoColor=white) | Password Hashing | 5.x |
| ![Helmet](https://img.shields.io/badge/Helmet-000000?logo=security&logoColor=white) | Security Headers | 7.x |
| ![CORS](https://img.shields.io/badge/CORS-000000?logo=cors&logoColor=white) | Cross-Origin Resource Sharing | 2.x |

### **External Services**
| Technology | Purpose |
|------------|---------|
| ![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white) | Payment Processing |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white) | File & Image Storage |
| ![SendGrid](https://img.shields.io/badge/SendGrid-00B2FF?logo=sendgrid&logoColor=white) | Email Service |
| ![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white) | Real-time Communication |

</div>

---

## 🏗 Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
        C[Admin Panel]
    end
    
    subgraph "API Layer"
        D[Express Server]
        E[Authentication Middleware]
        F[Rate Limiter]
        G[Request Validator]
    end
    
    subgraph "Service Layer"
        H[User Service]
        I[Appointment Service]
        J[Payment Service]
        K[Video Call Service]
        L[Prescription Service]
    end
    
    subgraph "Data Layer"
        M[(PostgreSQL)]****
        N[(Redis Cache)]
        O[Prisma ORM]
    end
    
    subgraph "External Services"
        P[Stripe]
        Q[Cloudinary]
        R[SendGrid]
        S[WebRTC]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    H --> O
    I --> O
    J --> P
    K --> S
    L --> O
    O --> M
    O --> N
    H --> R
    I --> Q**