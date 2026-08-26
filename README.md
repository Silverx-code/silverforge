# SilverForge

SilverForge is a multi-tenant e-commerce website builder. A merchant can create a store, customize its homepage, add products, publish the storefront, and receive manual orders.

## Pages

## Roles and permissions

SilverForge currently has three user contexts. There is no platform-admin role in the application yet.

| Role | Authentication | Permissions |
| --- | --- | --- |
| Platform visitor | Not required | View the landing page, sign up, log in, and browse published storefronts. |
| Merchant / store owner | Required | Create one store, configure its storefront, manage products and inventory, view and update that store's orders, and publish or unpublish the store. Every dashboard API operation is scoped to the signed-in owner's store. |
| Customer | Not required | Browse a published store, maintain a browser-local cart, and submit an order with contact and delivery details. Customers cannot access merchant data or unpublished stores. |

## User guide

### Merchant: create and launch a store

1. Create an account at `/signup`, then follow the onboarding flow.
2. Choose a store name, description, and unique URL slug.
3. Open **Products** in the dashboard and add products with a price, description, image URL, and inventory quantity.
4. Open **My Website** to edit, hide, show, and reorder the homepage sections.
5. Open **Store Settings** to set branding colors, font, button style, logo URL, and publication status.
6. Publish the store when it is ready, then share the public `/store/[slug]` URL.

### Merchant: manage products and inventory

- A product with inventory quantity `0` is automatically marked out of stock and cannot be checked out.
- Checkout atomically reserves stock, so completed orders reduce the remaining quantity.
- Use the product stock control to temporarily pause sales. Setting it back to in stock restores at least one available unit if the quantity was zero; set an exact starting quantity when adding a product.

### Merchant: fulfill orders

1. Open **Orders** in the dashboard.
2. Review the customer name, phone number, address, line items, and total.
3. Move the order through `PENDING`, `CONFIRMED`, `FULFILLED`, or `CANCELLED` as you process it.

Checkout creates manual orders only. Contact customers directly to arrange payment and delivery until a payment provider is integrated.

### Customer: place an order

1. Visit a published store at `/store/[slug]`.
2. Open a product and select **Add to cart**.
3. Review items and quantities in the cart. The cart is saved in the current browser for that store.
4. Proceed to checkout and provide a name, phone number, and delivery address.
5. Submit the order. The merchant receives it as a pending order and will contact the customer to confirm it.

### Platform and authentication

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Currently renders the store-owner overview when a signed-in user already owns a store. Visitors without a store see no content; this route is intended to become the platform landing page. |
| `/signup` | Public | Creates an account with a name, email address, and password. Successful signup creates a signed JWT session cookie. |
| `/login` | Public | Signs an existing user in. The optional `next` query parameter returns the user to the protected page they originally requested. |
| `/onboarding` | Signed-in users without a store | Two-step store creation flow: choose the store name and description, then select a unique public slug. It creates the default homepage sections. |

### Merchant dashboard

All dashboard pages require a valid session and a store owned by that user. Users without a store are redirected to `/onboarding`.

| Route | Description |
| --- | --- |
| `/dashboard` | Overview of the current store, including publication state, product count, total orders, and pending orders. |
| `/dashboard/website` | Homepage section editor. Merchants can show or hide sections, move them up or down, and edit their text content. Default sections are Header, Hero, Featured Products, Promo Banner, About, and Footer. |
| `/dashboard/products` | Product management page for creating, editing, and deleting products. A product has a name, optional description and image URL, price, and stock status. |
| `/dashboard/orders` | Lists store orders and their line items. Merchants can update an order from Pending to Confirmed, Fulfilled, or Cancelled. |
| `/dashboard/settings` | Updates store identity and storefront appearance: name, description, logo URL, primary/background colors, font, button style, and whether the store is published. |

The dashboard sidebar also includes a **View public store** link and a sign-out action.

### Public storefront

Public storefront pages are available only when the store is published. Each store is addressed by its unique slug.

| Route | Description |
| --- | --- |
| `/store/[slug]` | Store homepage. It renders visible sections in their configured order and applies the store's colors, font, and button style. The featured-products section displays up to eight products. |
| `/store/[slug]/product/[id]` | Product detail page, including product name, price, description, stock state, and add-to-cart action. Products are scoped to the current store. |
| `/store/[slug]/cart` | Client-side shopping cart. It is stored in `localStorage` separately for each store and supports quantity changes and item removal. |
| `/store/[slug]/checkout` | Captures the customer's name, phone number, and delivery address. Submitting the form creates a `PENDING` order; no payment provider is connected in this MVP. |

## API routes

### Authentication

| Method and route | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Creates a user account and starts a session. |
| `POST /api/auth/login` | Verifies credentials and starts a session. |
| `POST /api/auth/logout` | Clears the session cookie. |
| `GET /api/auth/me` | Returns the current user and their stores. |

### Merchant data

| Method and route | Purpose |
| --- | --- |
| `POST /api/stores` | Creates the signed-in user's store and its default sections. One store per user is enforced by the MVP flow. |
| `GET /api/stores/[storeId]` | Returns a store when it belongs to the signed-in user. |
| `PATCH /api/stores/[storeId]` | Updates the signed-in user's store settings. |
| `GET /api/products` | Lists products for the current owner's store. |
| `POST /api/products` | Creates a product for the current owner's store. |
| `PATCH /api/products/[id]` | Updates an owned product. |
| `DELETE /api/products/[id]` | Deletes an owned product. |
| `GET /api/sections` | Lists the current owner's homepage sections in display order. |
| `PATCH /api/sections/[id]` | Updates an owned section's content, visibility, or order. |
| `GET /api/orders` | Lists orders for the current owner's store. |
| `PATCH /api/orders/[id]` | Updates an order status for the current owner's store. |

### Public data

| Method and route | Purpose |
| --- | --- |
| `GET /api/public/store/[slug]` | Returns a published store, its visible sections, and products. |
| `POST /api/public/store/[slug]/checkout` | Validates customer details and product IDs, then creates a pending order and its line items. |

## Running locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure `DATABASE_URL` and `AUTH_SECRET`.
3. Apply the database schema: `npm run db:push`
4. Optionally load a demo store: `npm run db:seed` (sign in with `demo@silverforge.test` / `demo-password-123`).
5. Start the application: `npm run dev`
6. Open `http://localhost:3000`.

Run the current automated checks with `npm test` and `npm run lint`.

## Current MVP boundaries

- One store per user in the onboarding experience.
- Product and logo images are URL fields; image uploads are not implemented.
- Checkout creates manual orders only; there is no payment gateway.
- The cart is local to the browser and store slug.
- Homepage sections are edited with forms and reordered with up/down controls rather than drag-and-drop.
#   s i l v e r f o r g e  
 