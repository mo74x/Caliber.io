# Caliber.io Backend

A talent recruitment platform API built with NestJS, MongoDB, and Stripe. Recruiters can search, unlock, and bookmark candidate profiles using a credit-based system.

## Tech Stack

- **Framework**: NestJS 11
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + Passport
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Email**: Nodemailer with Handlebars templates
- **Documentation**: Swagger/OpenAPI

## Features

### 🔐 Authentication

- User registration with role-based access (Candidate, Recruiter, Admin)
- JWT-based authentication
- Password reset via email with secure tokens
- Admin approval workflow for new users

### 👤 User Management

- User registration and profile management
- Credit system for recruiters
- Admin can approve/reject pending users
- Role-based access control (RBAC)

### 📋 Candidate Profiles

- Candidates can create and manage their profiles
- CV/resume upload to Cloudinary (PDF, images up to 5MB)
- Profile search with filters (skills, location, job title, etc.)
- Paginated search results
- Profile unlocking system (costs credits)

### 🔖 Bookmarks

- Recruiters can bookmark candidate profiles
- View all bookmarked candidates
- Add/remove bookmarks

### 💳 Payments (Stripe)

- Stripe Checkout integration for purchasing credits
- Webhook handling for payment verification
- Automatic credit addition after successful payment

### 📧 Email

- Password reset emails with secure tokens
- Unlock notification emails to candidates
- Handlebars email templates

### 📊 Analytics

- Track recruiter activity (profile views, unlocks)
- Dashboard with aggregated stats
- Event logging for audit trail

## Getting Started

### Prerequisites

- Node.js 20+ (required for NestJS 11, Mongoose 9, etc.)
- MongoDB instance
- Stripe account
- Cloudinary account
- SMTP server (for emails)
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/caliber

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SMTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
MAIL_FROM=noreply@caliber.io

# App
FRONTEND_URL=http://localhost:3000
```

### Running the App

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Running with Docker

The easiest way to run the entire stack (API + MongoDB):

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down
```

**Environment Variables for Docker:**

Docker Compose automatically reads from your `.env` file. You can also set variables directly in `docker-compose.yml` under the `environment` section.

The Docker setup uses:
- **Node.js 22 Alpine** for the API container
- **MongoDB latest** for the database container
- Persistent volume for MongoDB data

### Testing Stripe Webhooks Locally

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3001/payments/webhook
   ```
3. Copy the webhook signing secret and add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## API Documentation

Once the server is running, access the Swagger UI at:

```
http://localhost:3001/api
```

## API Endpoints

### Auth (`/auth`)

| Method | Endpoint                | Description                  |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/auth/login`           | Login with email/password    |
| POST   | `/auth/forgot-password` | Request password reset email |
| POST   | `/auth/reset-password`  | Reset password with token    |

### Users (`/users`)

| Method | Endpoint             | Description          | Auth  |
| ------ | -------------------- | -------------------- | ----- |
| POST   | `/users`             | Register new user    | -     |
| GET    | `/users`             | Get all users        | Admin |
| POST   | `/users/:id/approve` | Approve pending user | Admin |
| POST   | `/users/add-credits` | Add credits (dev)    | JWT   |

### Candidates (`/candidates`)

| Method | Endpoint                 | Description              | Auth |
| ------ | ------------------------ | ------------------------ | ---- |
| POST   | `/candidates`            | Create candidate profile | JWT  |
| GET    | `/candidates/me`         | Get my profile           | JWT  |
| GET    | `/candidates/search`     | Search candidates        | -    |
| GET    | `/candidates/:id`        | View candidate (logged)  | JWT  |
| GET    | `/candidates/:id/unlock` | Unlock a candidate       | JWT  |
| POST   | `/candidates/upload-cv`  | Upload CV file           | JWT  |

### Bookmarks (`/bookmarks`)

| Method | Endpoint                  | Description          | Auth |
| ------ | ------------------------- | -------------------- | ---- |
| POST   | `/bookmarks/:candidateId` | Bookmark a candidate | JWT  |
| DELETE | `/bookmarks/:candidateId` | Remove bookmark      | JWT  |
| GET    | `/bookmarks`              | Get my bookmarks     | JWT  |

### Payments (`/payments`)

| Method | Endpoint                            | Description            | Auth |
| ------ | ----------------------------------- | ---------------------- | ---- |
| POST   | `/payments/create-checkout-session` | Create Stripe checkout | JWT  |
| GET    | `/payments/success`                 | Payment success page   | -    |
| GET    | `/payments/cancel`                  | Payment cancelled page | -    |
| POST   | `/payments/webhook`                 | Stripe webhook handler | -    |

### Analytics (`/analytics`)

| Method | Endpoint               | Description         | Auth |
| ------ | ---------------------- | ------------------- | ---- |
| GET    | `/analytics/dashboard` | Get recruiter stats | JWT  |

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── roles.guard.ts
├── users/                # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   └── schemas/
├── candidates/           # Candidate profiles
│   ├── candidates.controller.ts
│   ├── candidates.service.ts
│   ├── dto/
│   └── schemas/
├── bookmarks/            # Bookmark functionality
│   ├── bookmarks.controller.ts
│   ├── bookmarks.service.ts
│   └── schemas/
├── payments/             # Stripe integration
│   ├── payments.controller.ts
│   └── payments.service.ts
├── analytics/            # Analytics & tracking
│   ├── analytics.controller.ts
│   ├── analytics.service.ts
│   └── schemas/
├── cloudinary/           # File upload service
│   └── cloudinary.service.ts
├── mail/                 # Email service
│   └── mail.service.ts
├── app.module.ts
└── main.ts
```

## License

UNLICENSED
