CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(30) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  account_type VARCHAR(20) NOT NULL DEFAULT 'SELLER' CHECK (account_type IN ('SELLER', 'CUSTOMER')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE button_style AS ENUM ('ROUNDED', 'SQUARE', 'PILL');

CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(30) PRIMARY KEY,
  owner_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo TEXT,
  whatsapp_number VARCHAR(20),
  primary_color VARCHAR(50) DEFAULT '#111114',
  background_color VARCHAR(50) DEFAULT '#FAFAF8',
  font VARCHAR(100) DEFAULT 'Inter',
  button_style button_style DEFAULT 'ROUNDED',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE section_type AS ENUM ('HEADER', 'HERO', 'FEATURED_PRODUCTS', 'PROMO_BANNER', 'ABOUT', 'FOOTER');

CREATE TABLE IF NOT EXISTS sections (
  id VARCHAR(30) PRIMARY KEY,
  store_id VARCHAR(30) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  section_type section_type NOT NULL,
  content JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT TRUE,
  section_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_store_section_type UNIQUE (store_id, section_type)
);

CREATE INDEX IF NOT EXISTS idx_sections_store_order ON sections(store_id, section_order);

CREATE TYPE stock_status AS ENUM ('IN_STOCK', 'OUT_OF_STOCK');

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(30) PRIMARY KEY,
  store_id VARCHAR(30) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  image TEXT,
  stock_status stock_status DEFAULT 'IN_STOCK',
  inventory_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(30) PRIMARY KEY,
  store_id VARCHAR(30) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  status order_status DEFAULT 'PENDING',
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(30) PRIMARY KEY,
  order_id VARCHAR(30) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(30) NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(12, 2) NOT NULL
);

-- These keep existing databases compatible when `npm run db:setup` is run again.
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) NOT NULL DEFAULT 'SELLER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
-- Existing store owners have already completed the original creation flow.
UPDATE users SET account_type = 'SELLER', onboarding_completed = TRUE
WHERE EXISTS (SELECT 1 FROM stores WHERE stores.owner_id = users.id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS stores_set_updated_at ON stores;
CREATE TRIGGER stores_set_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS sections_set_updated_at ON sections;
CREATE TRIGGER sections_set_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
