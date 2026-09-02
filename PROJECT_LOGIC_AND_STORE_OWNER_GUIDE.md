# SilverForge: project logic and store-owner guide

This guide describes the current application, as implemented. SilverForge is a multi-tenant e-commerce builder: each seller owns one store, configures it in a protected dashboard, and customers shop at `/store/<store-slug>`.

## Store-owner quick guide

## Required account onboarding

Every new account now completes a short, role-specific tutorial before using account features:

- **Sellers** learn the launch flow, then create their store. Creating that store completes onboarding atomically, so later sign-ins go straight to the dashboard.
- **Customers** learn how published stores, per-store carts, and checkout work, then start browsing.
- Visitors who have not created an account can still open a shared published-store link. A signed-in account with incomplete onboarding is redirected to `/onboarding` before it can browse a store.

The `users` table records the selected `account_type` (`SELLER` or `CUSTOMER`) and `onboarding_completed` state. Run `npm run db:setup` after pulling this change to add these fields to an existing database.

### 1. Create a seller account and store

1. Open `/signup`, enter a name, email address, and password (at least eight characters).
2. Complete onboarding and choose **I want to sell**.
3. Enter the store name and description.
4. Confirm a unique URL slug. For example, `ada-crafts` produces `/store/ada-crafts`. Slugs may contain lowercase letters, numbers, and single dashes.
5. Select **Launch workspace**. SilverForge creates the store plus six editable homepage sections: Header, Hero, Featured Products, Promo Banner, About, and Footer.

Only one store per seller account is currently supported.

### 2. Add products

1. Sign in and open **Dashboard → Products**.
2. Enter the product name, price (in naira), optional description, optional product-image URL, and available inventory quantity.
3. Select **Save product**. A positive quantity marks the product in stock; zero marks it out of stock.
4. Use the product list to edit details or remove products that have never appeared in an order. Products with order history cannot be deleted, preserving historical orders.

The product-image URL is optional. Without one, the storefront shows an image placeholder.

### WhatsApp purchases

During seller onboarding, enter a WhatsApp business number with its country code (for example, `2348012345678`). It is stored with the store and can later be changed in **Dashboard → Settings**. On each product page, customers see **Buy on WhatsApp** when a number is available. The link opens WhatsApp with a ready-to-send message containing the store name, product name, and current displayed price.

## Product logic

### Product data and validation

Each product belongs to exactly one store and has a generated `prd_...` ID, name, optional description/image URL, price, stock status, and inventory quantity. The server accepts only:

- a name of 1–160 characters;
- a positive price;
- a description up to 2,000 characters;
- an optional valid HTTPS/HTTP image URL;
- a whole inventory quantity from 0 to 1,000,000.

All dashboard product requests are scoped to the signed-in seller's store. A seller cannot view, edit, or delete another seller's product, even if they know its ID.

### Stock rules

```text
Seller saves product
  quantity > 0  ──► IN_STOCK ──► product can be added to cart
  quantity = 0  ──► OUT_OF_STOCK ──► purchase button is disabled

Customer completes checkout
  available quantity decreases atomically
  reaches 0 ──► OUT_OF_STOCK

Seller cancels order
  ordered quantity is restored once
  product becomes IN_STOCK
```

The cart is only a browser convenience; it does not reserve stock. The checkout endpoint is the source of truth: it locks the relevant database rows, checks the latest quantity and in-stock status, deducts stock, and creates the order in one transaction. This means two customers cannot successfully buy the same final unit. If stock changed first, checkout returns a sold-out message and the customer must update their cart.

Customers may request up to 20 units of a single product and up to 50 distinct cart lines per checkout. Prices are read again from the database during checkout, and the order total is calculated with decimal arithmetic rather than JavaScript floating-point numbers.

### Editing and deletion

Editing a product can update its name, description, price, image URL, inventory quantity, or stock status. Setting quantity to zero always makes it out of stock. A seller can explicitly mark a product out of stock even while retaining a positive quantity, which is useful for pausing sales. Restoring it to in stock with no quantity automatically gives it at least one unit.

Deletion is intentionally restricted: a product with an `order_items` record cannot be deleted, because an order must continue to identify what the customer purchased. Such a product can instead be marked out of stock.

### 3. Make the website yours

1. Open **Dashboard → Website** to choose a section, change its heading/text, hide or show it, and move it up or down.
2. Open **Dashboard → Settings** to set the primary/background colours, font, and button shape.
3. In Settings, choose **Publish** when ready. The public address is shown beneath the page title and has the form `/store/<slug>`.

The featured-products section normally shows the latest products. The underlying data can store a specific `productIds` list, but the current editor does not expose a product picker.

### 4. Handle customer orders

Customers add items to a browser-local cart and submit their name, phone number, and delivery address at checkout. The system validates stock, reduces inventory in a database transaction, creates a `PENDING` order, and clears the customer cart. In **Dashboard → Orders**, change the status to `CONFIRMED`, `FULFILLED`, or `CANCELLED`. Cancelling an order returns its quantities to inventory once.

## How the application fits together

```text
Seller dashboard ──► protected API routes ──► PostgreSQL
                                            ▲
Customer storefront ─► public store/checkout API ┘
```

- **Next.js App Router** renders pages and route handlers.
- **PostgreSQL** is accessed directly through `pg`; there is no Prisma client in this implementation.
- **JWT session cookies** identify a signed-in seller.
- **Store ownership checks** scope dashboard data changes to that seller's store.
- **Database transactions and row locks** prevent checkout from overselling inventory.

## File-by-file reference

### Root and configuration files

| File | Logic / responsibility |
| --- | --- |
| `.env.example` | Documents `DATABASE_URL`, `AUTH_SECRET`, and public app URL required for a local deployment. |
| `.eslintrc.json` | Enables Next.js Core Web Vitals lint rules. |
| `.gitignore` | Keeps dependencies, build output, logs, and secrets out of Git. |
| `package.json` | Declares runtime dependencies and commands: development server, build, tests, database setup, and demo seed. |
| `package-lock.json` | Locks exact npm dependency versions. |
| `next.config.mjs` | Permits remote HTTPS images from any host for Next.js image configuration. |
| `next-env.d.ts` | Generated TypeScript declarations required by Next.js. |
| `postcss.config.mjs` | Runs Tailwind CSS and Autoprefixer during CSS processing. |
| `tailwind.config.ts` | Defines source scan paths and the SilverForge colour, typeface, and shadow design tokens. |
| `tsconfig.json` | Enables strict, no-output TypeScript checking and the `@/` alias for `src/`. |
| `tsconfig.tsbuildinfo` | TypeScript incremental-build cache; generated, not application logic. |
| `README.md` | Earlier technical overview. Some statements are historical; use this document for the current `pg`-based implementation. |

### Database scripts and tests

| File | Logic / responsibility |
| --- | --- |
| `scripts/schema.sql` | Creates users, stores, sections, products, orders, and order items; defines status enums, indexes, foreign keys, and update-time triggers. Stores form the tenant boundary. |
| `scripts/setup-db.ts` | Reads and executes `schema.sql`, then closes the connection pool. Run with `npm run db:setup`. |
| `scripts/seed.ts` | Idempotently creates the demo merchant/store, default content, and sample products. Run with `npm run db:seed`. |
| `tests/money.test.ts` | Confirms order totals use decimal arithmetic, avoiding JavaScript floating-point rounding errors. |

### Shared server and domain logic (`src/lib`, `src/types`, middleware)

| File | Logic / responsibility |
| --- | --- |
| `src/types/db.ts` | TypeScript shapes and enum unions mirroring database records. |
| `src/lib/db.ts` | Creates/reuses the PostgreSQL connection pool and exposes a safe query helper that always releases connections. |
| `src/lib/id.ts` | Generates cryptographically random, URL-safe IDs with entity prefixes such as `usr_`, `sto_`, and `prd_`. |
| `src/lib/auth.ts` | Signs/verifies seven-day HS256 JWTs and manages the HTTP-only `sf_session` cookie. |
| `src/lib/password.ts` | Hashes and verifies passwords using bcrypt. |
| `src/lib/rate-limit.ts` | Provides a process-local, IP-keyed request throttle for sign-in, sign-up, and checkout. A shared backing store is needed for multi-instance production. |
| `src/lib/money.ts` | Uses `decimal.js` to calculate precise order totals. |
| `src/lib/tenant.ts` | Resolves the current session's owned store; the protected API routes depend on it for tenant isolation. |
| `src/lib/store-data.ts` | Converts SQL rows to app types and loads a published store, its visible sections, and products for the public storefront. |
| `src/lib/cart-context.tsx` | Client-side React cart provider. It stores a separate cart in `localStorage` for each store slug and calculates its displayed total. |
| `src/middleware.ts` | Requires a valid session for `/dashboard` and `/onboarding`, redirecting guests to login with a return URL. |

### Main application pages

| File | Logic / responsibility |
| --- | --- |
| `src/app/globals.css` | Global Tailwind layers and reusable visual styles, including inputs, cards, and SilverForge buttons. |
| `src/app/layout.tsx` | Root HTML/body wrapper and site metadata. |
| `src/app/page.tsx` | Public platform landing page, with calls to action for seller sign-up and sign-in. |
| `src/app/login/page.tsx` | Client login form; posts credentials to the login API and returns to the requested page or dashboard. |
| `src/app/signup/page.tsx` | Client registration form; posts account details and sends a new seller to onboarding. |
| `src/app/onboarding/page.tsx` | Role-choice and seller wizard. It slugifies the store name and posts the finished store setup. |

### Merchant dashboard pages

| File | Logic / responsibility |
| --- | --- |
| `src/app/dashboard/layout.tsx` | Server-side guard and dashboard shell. Any authenticated account with an owned store enters the dashboard directly; accounts without a store are redirected to onboarding. |
| `src/app/dashboard/page.tsx` | Dashboard overview that summarizes the merchant's products, orders, and publishing state. |
| `src/app/dashboard/logout-button.tsx` | Client button that calls the logout endpoint and returns to the landing page. |
| `src/app/dashboard/products/page.tsx` | Product management screen. Loads products and submits create, edit, and delete requests. |
| `src/app/dashboard/orders/page.tsx` | Fetches the store's orders and lets the merchant update each fulfilment status. |
| `src/app/dashboard/settings/page.tsx` | Loads store settings and saves branding, WhatsApp contact, and publishing changes as they are made. |
| `src/app/dashboard/website/page.tsx` | Design Studio for reordering/hiding sections and editing relevant content fields. It provides a live-style preview and saves changes through the section API. |

### Customer storefront pages

| File | Logic / responsibility |
| --- | --- |
| `src/app/store/[slug]/layout.tsx` | Requires a published store, injects that store's CSS theme variables, and wraps visitors in a store-specific cart provider. |
| `src/app/store/[slug]/page.tsx` | Loads the published store and renders its visible Header, Hero, Promo, Featured Products, About, and Footer sections. |
| `src/app/store/[slug]/product/[id]/page.tsx` | Loads a product only when it belongs to the published store, then shows its details, cart action, and prefilled WhatsApp purchase link when configured. |
| `src/app/store/[slug]/add-to-cart-button.tsx` | Adds an in-stock product to the local cart and exposes a cart link after it is added. |
| `src/app/store/[slug]/cart/page.tsx` | Displays cart items, supports quantity/removal changes, and links to checkout. |
| `src/app/store/[slug]/checkout/page.tsx` | Collects delivery data, posts the local cart to checkout, clears it after success, and shows confirmation. |

### Authentication API routes

| File | Logic / responsibility |
| --- | --- |
| `src/app/api/auth/signup/route.ts` | Validates account data, rate-limits requests, rejects duplicate emails, hashes the password, creates the user, and starts a session. |
| `src/app/api/auth/login/route.ts` | Rate-limits login attempts, verifies email/password, and writes a fresh session cookie. |
| `src/app/api/auth/logout/route.ts` | Removes the session cookie. |
| `src/app/api/auth/me/route.ts` | Returns the authenticated user's basic details plus owned-store summaries. |
| `src/app/api/auth/onboarding/route.ts` | Records the customer's or seller's completed tutorial. Seller completion is accepted only after that user owns a store. |

### Store, product, section, and order API routes

| File | Logic / responsibility |
| --- | --- |
| `src/app/api/stores/route.ts` | Creates one store for the signed-in user, validates its unique slug, adds six default sections, and atomically completes seller onboarding. |
| `src/app/api/stores/[storeId]/route.ts` | Lets only the owner read or patch store details, theme fields, and publication status. |
| `src/app/api/products/route.ts` | Lists the owner's products and validates/creates new products. It derives stock status from quantity and explicit out-of-stock choice. |
| `src/app/api/products/[id]/route.ts` | Ensures ownership before updating a product or deleting one with no order history. |
| `src/app/api/sections/route.ts` | Lists all sections (including hidden ones) for the current store. |
| `src/app/api/sections/[id]/route.ts` | Validates ownership and patches section content, visibility, or position. Content is merged with existing JSON. |
| `src/app/api/sections/reorder/route.ts` | Atomically swaps a selected section's order with its adjacent neighbour. |
| `src/app/api/orders/route.ts` | Lists orders belonging to the owner's store and groups their product line items. |
| `src/app/api/orders/[id]/route.ts` | Updates an owned order status in a transaction; a first cancellation restores ordered stock. |

### Public API routes

| File | Logic / responsibility |
| --- | --- |
| `src/app/api/public/store/[slug]/route.ts` | Returns a published store, its visible sections, and its products to anonymous customers. |
| `src/app/api/public/store/[slug]/checkout/route.ts` | Validates customer/order input and rate limits checkout. It locks product rows, verifies stock, decrements inventory, marks depleted products out of stock, creates the order/items, and commits atomically. |

### Design-source assets

| Path | Logic / responsibility |
| --- | --- |
| `stitch_silverforge_e_commerce_builder/*/code.html` | Static design/reference HTML exported from Stitch; not executed by the Next.js application. |
| `stitch_silverforge_e_commerce_builder/*/screen.png` | Corresponding screenshot references. |
| `stitch_silverforge_e_commerce_builder/silverforge/DESIGN.md` | Visual design specification for the original concept. |
| `stitch_silverforge_e_commerce_builder.zip` | Archived copy of the same design-source material. |

## Local setup

1. Copy `.env.example` to `.env` and use a real PostgreSQL connection string and strong `AUTH_SECRET`.
2. Run `npm install`.
3. Run `npm run db:setup` to create the database objects.
4. Optionally run `npm run db:seed` for the demo store (`demo@silverforge.test` / `demo-password-123`).
5. Run `npm run dev`, then open `http://localhost:3000`.

Run `npm test` to verify money calculations. `npm run lint` is defined, though its success depends on the installed Next.js lint command support.
