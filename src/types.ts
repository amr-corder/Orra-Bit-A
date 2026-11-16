export type Category = 'All' | 'Signature Editions' | 'Graphic Series' | 'Minimalist Oversized' | 'Earthy Tones' | 'Deep Navy';

export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Exclude<Category, 'All'>;
  price: number;
  originalPrice?: number;
  currency?: string;
  color: string;
  description: string;
  composition: string;
  origin: string;
  fit: string;
  care: string;
  images: string[];
  sizes: ProductSize[];
  inStockSizes: ProductSize[];
  featured?: boolean;
  isNew?: boolean;
  editorialKicker?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  id: string;
  product: Product;
  size: ProductSize;
  quantity: number;
}

export interface LookbookSpread {
  id: string;
  chapter: string;
  title: string;
  quote: string;
  narrative: string;
  primaryImage: string;
  secondaryImage: string;
  featuredProductIds: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface StoreSettings {
  heroEyebrow: string;
  heroSeason: string;
  heroTitle: string;
  heroQuote: string;
  heroDescription: string;
  heroLeftImage: string;
  heroLeftLabel: string;
  heroLeftPrice: string;
  heroRightImage: string;
  heroRightTitle: string;
  heroRightDescription: string;
  heroRightBadge: string;
  bannerTitle: string;
  bannerQuote: string;
  bannerDescription: string;
  bannerImage: string;
  instapayIpa: string;
  vodafoneCashNumber: string;
  freeShippingThreshold: number;
  shippingFee: number;
  initialized: boolean;
  updatedAt?: unknown;
}

export type PaymentMethod = 'instapay' | 'vodafone-cash' | 'cod';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  productId: string;
  name: string;
  sku: string;
  size: ProductSize;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id?: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  items: OrderLineItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ViewLayout = 'grid-4' | 'grid-3' | 'lookbook';
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';
export type ActivePage = 'storefront' | 'dashboard';
