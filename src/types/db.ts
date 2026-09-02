export type ButtonStyle = "ROUNDED" | "SQUARE" | "PILL";
export type SectionType = "HEADER" | "HERO" | "FEATURED_PRODUCTS" | "PROMO_BANNER" | "ABOUT" | "FOOTER";
export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK";
export type OrderStatus = "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED";
export type AccountType = "SELLER" | "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  accountType: AccountType;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  whatsappNumber: string | null;
  primaryColor: string;
  backgroundColor: string;
  font: string;
  buttonStyle: ButtonStyle;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  storeId: string;
  sectionType: SectionType;
  content: any;
  isVisible: boolean;
  sectionOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: string | number; // stored as Decimal in DB
  image: string | null;
  stockStatus: StockStatus;
  inventoryQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  phone: string;
  address: string;
  status: OrderStatus;
  total: string | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string | number;
}
