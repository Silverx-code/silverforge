# SilverForge

SilverForge is a multi-tenant e-commerce builder. Sellers create and customize a storefront, manage inventory, and process customer orders. The application uses Next.js App Router, PostgreSQL through `pg`, and signed JWT session cookies.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `AUTH_SECRET`.
2. Run `npm install`.
3. Run `npm run db:setup` to create or update the PostgreSQL schema.
4. Optionally run `npm run db:seed` to load the demo store.
5. Run `npm run dev` and open `http://localhost:3000`.

Use `npm test` for the unit tests and `npm run lint` for linting.

## Super Admin setup

Public signup always creates a seller account. To provision the initial platform administrator, set `SUPER_ADMIN_BOOTSTRAP_EMAIL` and `SUPER_ADMIN_BOOTSTRAP_PASSWORD` in a secure shell and run `npm run admin:bootstrap`. The command creates or resets that account and grants the Super Admin role. Remove those bootstrap variables when finished.

Super Admins can create Admin accounts through the admin users API. Admins can view platform visit analytics; sellers manage their own store through `/dashboard`.

## Project structure

- `src/app/` contains pages, dashboard screens, storefront pages, and API route handlers.
- `src/lib/` contains authentication, tenant access, database, money, cart, and rate-limit logic.
- `scripts/schema.sql` defines the PostgreSQL schema; `scripts/` contains setup, seed, and admin bootstrap commands.
- `tests/` contains unit tests for password policy, money calculations, and order status transitions.
- `stitch_silverforge_e_commerce_builder/` contains static design references and screenshots.

See [PROJECT_LOGIC_AND_STORE_OWNER_GUIDE.md](PROJECT_LOGIC_AND_STORE_OWNER_GUIDE.md) for the detailed user guide and API/file reference.
