# SilverForge: Technical Guide & Codebase Directory Map

SilverForge is a professional, high-trust multi-tenant e-commerce website builder designed under the **"Digital Forge"** brand aesthetic. It allows platform visitors to register, instantly spin up a custom e-commerce storefront, customize homepage sections via a streamlined fields-based website editor, manage product inventory, and fulfill manual orders.

This document serves as the master blueprint and reference guide, explaining **every file, folder, configuration, and architectural layer** in the SilverForge codebase.

---

## Workspace Directory Tree

Below is the complete map of the SilverForge workspace, illustrating how configuration, database modeling, business logic, multi-tenant UI, and testing fit together.

```text
silverforge/
├── .eslintrc.json           # ESLint code quality & Next.js linting configuration
├── .gitignore               # Ignored local files, build outputs, and credentials
├── next-env.d.ts            # Next.js TypeScript environment declarations
├── next.config.mjs          # Next.js bundler and compiler rules
├── package.json             # NPM project metadata, scripts, and dependency definitions
├── package-lock.json        # Locked dependency tree for deterministic builds
├── postcss.config.mjs       # Tailwind CSS post-processing setup
├── README.md                # This comprehensive master technical guide
├── tailwind.config.ts       # Design token configurations (colors, typography, spacing)
├── tsconfig.json            # Strict TypeScript compilation and path mapping configurations
│
├── prisma/                  # Database management & ORM Layer
│   ├── schema.prisma        # Prisma schema containing the relational database models
│   └── seed.ts              # Demo store seed script (Urban Threads & Glow by Ada)
│
├── tests/                   # Testing Suite
│   └── money.test.ts        # Node-native unit tests for floating-point calculation safety
│
├── src/                     # Core Application Source Code
│   ├── middleware.ts        # Global request-level auth redirects and session resolution
│   ├── app/                 # Next.js App Router (Routes, API, and UI Layouts)
│   │   ├── globals.css      # Core styles, Tailwind directives, and custom fonts
│   │   ├── layout.tsx       # Root React layout containing standard HTML document structure
│   │   ├── page.tsx         # Platform index (renders landing page or store-owner overview)
│   │   ├── api/             # App Router Serverless API Endpoints
│   │   │   ├── auth/        # Custom Session API (login, signup, logout, session status)
│   │   │   ├── orders/      # Admin endpoints to fetch and transition order states
│   │   │   ├── products/    # Admin CRUD endpoints for store products
│   │   │   ├── public/      # Anonymous customer endpoints (store/checkout endpoints)
│   │   │   ├── sections/    # Admin endpoints to show, hide, edit, and reorder home sections
│   │   │   └── stores/      # Admin endpoints to manage store configuration and settings
│   │   ├── dashboard/       # Protected Merchant Dashboard UI
│   │   │   ├── layout.tsx   # Sidebar structure, quick links, and theme wrapping
│   │   │   ├── page.tsx     # Overview cards, total orders, product counts, and active state
│   │   │   ├── logout-button.tsx # Interactive client-side logout trigger
│   │   │   ├── orders/      # List, review, and progress incoming orders
│   │   │   ├── products/    # Interactive forms for product inventory management
│   │   │   ├── settings/    # Store customizer (colors, fonts, button style, public toggle)
│   │   │   └── website/     # Homepage section editor with form inputs and ordering buttons
│   │   ├── login/           # Authentication login screen
│   │   ├── signup/          # Authentication signup screen
│   │   ├── onboarding/      # Two-step wizard to initialize a store (Name & URL slug)
│   │   └── store/           # Public Multi-Tenant Storefront UI
│   │       └── [slug]/      # Dynamic tenant storefront workspace
│   │           ├── layout.tsx # Dynamically sets active store theme (colors/fonts) via CSS variables
│   │           ├── page.tsx   # Renders the store's visible homepage sections in sequence
│   │           ├── add-to-cart-button.tsx # Interactive add-to-cart logic
│   │           ├── cart/      # Scoped shopping cart viewer reading client-side localStorage
│   │           ├── checkout/  # Order details form creating manual PENDING orders
│   │           └── product/
│   │               └── [id]/  # Product detail, pricing, and stock status page
│   │
│   └── lib/                 # Core Utilities, Contexts, and Security Logic
│       ├── auth.ts          # Custom JWT creation, verification, and cookie helpers
│       ├── cart-context.tsx # React Context providing client-side shopping cart utilities
│       ├── money.ts         # High-precision decimal calculations (avoiding JS float errors)
│       ├── password.ts      # Bcrypt integration for hashing and verifying passwords
│       ├── prisma.ts        # Prisma client singleton caching logic (prevents connection leaks)
│       ├── rate-limit.ts    # Serverless-friendly rate limiting for secure routes
│       └── tenant.ts        # Secure active-tenant workspace and session validation logic
│
└── stitch_silverforge_e_commerce_builder/ # Original mockups, wireframes, and design specs
    ├── merchant_dashboard_overview/       # Reference layout for the dashboard landing page
    ├── silverforge/
    │   └── DESIGN.md                      # "Digital Forge" complete design specs
    ├── silverforge_loading_workspace/     # Workspace loading splash screens
    ├── silverforge_platform_landing_page/ # Platform landing page wireframes
    ├── storefront_the_modern_smith/       # Reference storefront "The Modern Smith" layout
    └── website_editor_customize_storefront/ # Reference layouts for the section reorder/editor
```

---

## File-by-File Breakdown

### Root-Level Configurations
* **`package.json`**: Declares dependencies (`next`, `react`, `prisma`, `bcryptjs`, `jose`, `zod`, `tsx`), scripts (`dev`, `build`, `lint`, `test`), and developer tools.
* **`tsconfig.json`**: Implements TypeScript path mapping `~/` to `./src/` and sets up strict type safety rules suitable for Next.js App Router applications.
* **`tailwind.config.ts`**: Merges standard Tailwind styling utility with custom colors, fonts (Geist, Inter), spacing units, and radius classes matching the brand design spec.
* **`next.config.mjs`**: Next.js framework-level bundler options.
* **`postcss.config.mjs`**: Compiles modern and custom CSS directives into cross-browser supported Tailwind-based styling sheets.
* **`.eslintrc.json`**: Establishes rigorous standard syntax formatting to prevent development errors.
* **`.gitignore`**: Excludes workspace build directories (`.next/`), dependency folders (`node_modules/`), test coverage reports, local environment configurations (`.env`), and binary files from being tracked by git.

### Database Layer (`prisma/`)
* **`prisma/schema.prisma`**: The core source of truth for the project's relational model. Includes definitions for:
  - `User`: Handles account information and password authentication.
  - `Store`: Operates as the **tenant boundary**. Holds custom settings like brand colors (`primaryColor`, `backgroundColor`), font families, button border styles (`ButtonStyle` enum: ROUNDED, SQUARE, PILL), and publication status.
  - `Section`: Represents modular sections of a customized storefront homepage (`SectionType` enum: HEADER, HERO, FEATURED_PRODUCTS, PROMO_BANNER, ABOUT, FOOTER). Stores text and imagery payloads using Postgres-compatible JSON formats.
  - `Product`: Manages product names, descriptions, images, prices (Decimal data types for precision), stock availability, and direct stock control status.
  - `Order` & `OrderItem`: Tracks customer shipping requests, line items, and fulfillment stages (`OrderStatus` enum: PENDING, CONFIRMED, FULFILLED, CANCELLED).
* **`prisma/seed.ts`**: Installs mock databases simulating live environments for immediate debugging. Includes configurations for "Urban Threads" and "Glow by Ada".

### Testing (`tests/`)
* **`tests/money.test.ts`**: Contains automated assertions using the Node-native test runner (`node:test`). Validates that decimal arithmetic calculates multi-item orders correctly with no rounding issues.

### Shared Logic & Middleware (`src/lib/` & `src/middleware.ts`)
* **`src/middleware.ts`**: Regulates app routing behavior dynamically. Intercepts incoming requests and forces redirects:
  - Redirects guest users attempting to reach protected `/dashboard` or `/onboarding` paths back to `/login`.
  - Redirects logged-in users with existing stores away from `/onboarding` to `/dashboard`.
* **`src/lib/auth.ts`**: Custom session mechanism built directly on `jose`. Creates encrypted JWT payload strings, seals them, and appends them to client cookies.
* **`src/lib/tenant.ts`**: Extracts the current authenticated user's store from the DB using the active session token. Blocks unauthorized access to prevent data leaks.
* **`src/lib/prisma.ts`**: Ensures only a single connection pool instance of Prisma Client is shared across Next.js's hot-reload modules, preventing database connection exhaustion.
* **`src/lib/money.ts`**: Uses `Prisma.Decimal` to calculate order lines accurately, avoiding JavaScript floating-point errors (e.g., `0.1 + 0.2 = 0.30000000000000004`).
* **`src/lib/password.ts`**: Hashing and comparative evaluation of user passwords via `bcryptjs`.
* **`src/lib/rate-limit.ts`**: Simple rate limiter helper to secure authentication endpoints against brute-force attacks.
* **`src/lib/cart-context.tsx`**: Supplies storefront consumers with a responsive Cart Provider, automatically syncing quantities, item modifications, and totals to the browser's `localStorage` (segmented per store slug).

### Next.js App Pages & Routes (`src/app/`)
* **`src/app/globals.css`**: Core application style definitions. Maps Tailwind configuration guidelines and defines system font overrides.
* **`src/app/layout.tsx`**: Injects standard HTML body boundaries, fonts, and sets up metadata.
* **`src/app/page.tsx`**: Renders the system homepage. If a user is signed in and owns a store, they are shown a dashboard shortcut. Otherwise, they see the brand's landing platform.
* **`src/app/login/` & `src/app/signup/`**: Custom user registration and login forms with error feedback.
* **`src/app/onboarding/`**: Step-by-step wizard capturing the store's name, description, and unique custom URL slug. It automatically provisions 6 default layout sections (Header, Hero, Featured Products, Promo, About, Footer) in the database upon completion.
* **`src/app/dashboard/`**:
  - `page.tsx`: Summarizes current operations (total product count, pending and completed order logs, publishing indicators).
  - `products/`: A complete dashboard to view, add, update, or remove products (including precise inventory counts and in-stock statuses).
  - `orders/`: Track and progress orders from `PENDING` to `CONFIRMED`, `FULFILLED`, or `CANCELLED`.
  - `settings/`: Customize general store metadata and choose theme stylings (primary and background color hexes, font pairing, button styles).
  - `website/`: A live order-shuffling module allowing merchants to edit section text contents, adjust visibility, and reorder homepage layout modules.
* **`src/app/store/` (Dynamic Tenant Router)**:
  - `[slug]/layout.tsx`: Resolves store data by the sub-slug, and dynamically sets CSS variable definitions (`--store-primary`, `--store-bg`, and typography classes) to inject custom themes on the fly.
  - `[slug]/page.tsx`: Dynamically builds and displays the merchant's custom homepage template.
  - `[slug]/product/[id]/page.tsx`: Detail view with responsive stock indicators, dynamic descriptions, and cart hooks.
  - `[slug]/cart/page.tsx`: Simple overview of currently added products with checkout paths.
  - `[slug]/checkout/page.tsx`: Final client form capture to submit order parameters securely.

---

## Technical Architecture Overview

SilverForge uses Next.js server actions and API boundaries coupled with a multi-tenant relational schema to isolate store information.

```
       ┌────────────────────────────────────────────────────────┐
       │                     Next.js Client                     │
       └───────────────────────────┬────────────────────────────┘
                                   │
              Auth Cookies & API requests / Server Actions
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │               Middleware (Route Protection)            │
       └───────────────────────────┬────────────────────────────┘
                                   │
                     Active User / Tenant Resolved
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                  Business Logic / APIs                 │
       │     (Scoping operations strictly by authenticated      │
       │                store ownership context)                │
       └───────────────────────────┬────────────────────────────┘
                                   │
                         Prisma Client Queries
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │               PostgreSQL Relational Database           │
       └────────────────────────────────────────────────────────┘
```

---

## Local Development Setup

To run this application locally, follow these simple steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your connection details:
   ```bash
   cp .env.example .env
   ```
   - Ensure you specify a PostgreSQL connection string in `DATABASE_URL`. If using connection poolers (e.g. Supabase, PgBouncer, Neon), append `?pgbouncer=true&statement_cache_size=0` to prevent `42P05` prepared statement errors.
   - Specify `DIRECT_URL` for direct connection (used by `prisma db push` / `prisma migrate`).
   - Generate a secure JWT secret for `AUTH_SECRET` (e.g., using `openssl rand -base64 32`).

3. **Initialize Database Schema**:
   Deploy the relational mapping onto your active local/hosted database instance:
   ```bash
   npm run db:push
   ```

4. **Seed Demo Data (Optional)**:
   Pre-populate the database with demo accounts and configured storefronts:
   ```bash
   npm run db:seed
   ```
   *You can sign in using:*
   - **Email**: `demo@silverforge.test`
   - **Password**: `demo-password-123`

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

6. **Running Verification Suites**:
   - Run unit tests: `npm test`
   - Run code linter: `npm run lint`
