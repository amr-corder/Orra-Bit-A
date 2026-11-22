# ORRA BIT — Luxury Streetwear Storefront

Modern luxury streetwear e-commerce storefront and digital lookbook for **ORRA BIT**, built with React 19, TypeScript, Tailwind CSS v4, Vite, and Firebase Firestore.

## Features

- **Bilingual Storefront (English / Arabic)** with full RTL support, language switcher, and responsive editorial layout.
- **Live Firestore Catalog & Lookbooks**: Real-time products, lookbook spreads, and store configuration synced via Cloud Firestore.
- **Shopping Bag, Wishlist & Search**: Slide-over drawers, instant size quick-add, live shipping threshold progress, and fullscreen search overlay.
- **Checkout & Dispatch Experience**: Multi-step checkout supporting **InstaPay**, **Vodafone Cash**, and **Cash on Delivery**, followed by a custom dispatch animation and order receipt.
- **Admin Dashboard (`/admin-login`)**: Protected workspace for managing products, lookbooks, store settings, payment methods, and customer orders.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Database & Auth**: Firebase (Cloud Firestore catalog and settings) & Supabase (checkout orders and admin authentication)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your public Supabase values:

   ```bash
   cp .env.example .env
   ```

   Ensure `firebase-applet-config.json` contains your Firebase project configuration and configure the Supabase URL and publishable key. Run [`supabase/orders.sql`](./supabase/orders.sql) and [`supabase/admin_email_restriction.sql`](./supabase/admin_email_restriction.sql) in the Supabase SQL Editor to enable shared order storage, admin-only order access, and single-device admin sessions. Admin session locks expire after five minutes without renewal; apply the SQL script to update an existing deployment. Admins must sign in through Supabase with the authorized email or an `app_metadata.role` of `admin`. Checkout saves orders to Supabase without requiring Firebase sign-in.

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Type-check & build for production**

   ```bash
   npm run lint
   npm run build
   ```
