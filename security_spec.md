# Firestore Security Specification (`ORRA BIT`)

## 1. Data Invariants
1. **Catalog Integrity (`/products/{productId}`)**: Every product document must have a valid alphanumeric/hyphen ID matching `^[a-zA-Z0-9_\-]+$`, bounded strings, positive finite numeric `price`, bounded `images`, `sizes`, and `inStockSizes` arrays (at least 1 element, max 10), and server-verified `createdAt` and `updatedAt` timestamps (`request.time`). Only verified admins (`isAdmin()`) may create, update, or delete products.
2. **Lookbook Integrity (`/lookbooks/{spreadId}`)**: Every lookbook spread must have a valid ID, bounded editorial copy and image URLs, bounded `featuredProductIds` array (`<= 10`), and server-verified timestamps. Only verified admins may write.
3. **Store Settings Integrity (`/storeSettings/{settingId}`)**: Only document ID `main` is writable by verified admins, with strict key allowlist (`hasAll` & `hasOnly`), bounded strings, non-negative numbers, and server `updatedAt == request.time`.
4. **Order PII Isolation & Integrity (`/orders/{orderId}`)**: Orders contain PII (`email`, `phone`, `address`). Unauthenticated reads and blanket `list` queries are strictly forbidden. A verified signed-in user may only create an order where `userId == request.auth.uid`, initial `status == 'pending'`, `items.size() >= 1 && items.size() <= 30`, and server timestamps match `request.time`. Users may read (`get` / `list`) ONLY their own orders (`resource.data.userId == request.auth.uid`). Only verified admins can update order status or delete orders.
5. **Privilege Escalation Prevention (`/admins/{userId}`)**: Users cannot self-assign admin privileges. Only the bootstrapped root admin (`maro.mahrous67@gmail.com` with `email_verified == true`) or existing admins can manage `/admins`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Product Write**: Unauthenticated `CREATE` on `/products/fake-hoodie` -> `PERMISSION_DENIED`.
2. **Spoofed Admin Email (Unverified)**: Authenticated user with `email == 'maro.mahrous67@gmail.com'` and `email_verified == false` attempting `CREATE` on `/products/spoof` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Product**: Admin `UPDATE` on `/products/monolith` adding `{ isAdminPromo: true }` -> `PERMISSION_DENIED` (`hasOnly` / `affectedKeys` rejection).
4. **Resource Poisoning via Oversized ID**: Admin `CREATE` on `/products/` with 500-char ID -> `PERMISSION_DENIED` (`isValidId`).
5. **Resource Poisoning via Oversized String**: Admin `CREATE` with `description` > 2000 chars -> `PERMISSION_DENIED`.
6. **Negative Price Manipulation**: Admin `CREATE` on `/products/p1` with `price: -100` -> `PERMISSION_DENIED`.
7. **Client Timestamp Forgery**: `CREATE` on `/orders/o1` with client-supplied past `createdAt` != `request.time` -> `PERMISSION_DENIED`.
8. **Order Identity Spoofing**: User A (`uid_a`) creating `/orders/o2` with `userId: 'uid_b'` -> `PERMISSION_DENIED`.
9. **Order State Shortcutting**: Non-admin user creating `/orders/o3` with `status: 'delivered'` instead of `'pending'` -> `PERMISSION_DENIED`.
10. **PII Cross-User Read Leak**: User A (`uid_a`) calling `GET` or `LIST` on `/orders` belonging to User B (`uid_b`) -> `PERMISSION_DENIED`.
11. **Terminal Order Mutation by Non-Admin**: User A attempting to `UPDATE` their own order after creation -> `PERMISSION_DENIED`.
12. **Self-Admin Escalation**: Non-admin user attempting `CREATE` on `/admins/{request.auth.uid}` with `{ role: 'admin' }` -> `PERMISSION_DENIED`.
