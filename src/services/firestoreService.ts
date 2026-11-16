import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocFromServer,
  getDoc,
  writeBatch,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, ROOT_ADMIN_EMAIL } from '../firebase';
import { PRODUCTS as INITIAL_PRODUCTS, LOOKBOOK_SPREADS as INITIAL_LOOKBOOKS } from '../data/products';
import {
  Product,
  LookbookSpread,
  StoreSettings,
  Order,
  OrderStatus
} from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  heroEyebrow: 'OVAEN / HOODIES ARCHIVE',
  heroSeason: 'STREETWEAR COLLECTION',
  heroTitle: 'COLLECTION 04',
  heroQuote: '100% premium heavyweight cotton, dropped-shoulder ease, and authentic street graphics.',
  heroDescription:
    'Discover the complete Ovaen Hoodies Collection. Featuring iconic pieces like Rise Again, Counter Culture, Ace of Spades, and minimalist oversized silhouettes.',
  heroLeftImage:
    'https://cdn.shopify.com/s/files/1/0850/3676/1324/files/a44e00a9-c2ff-47aa-a06b-26ca62619d1c.jpg?v=1791429762',
  heroLeftLabel: 'Counter Culture Black Hoodie',
  heroLeftPrice: '810 EGP',
  heroRightImage:
    'https://cdn.shopify.com/s/files/1/0850/3676/1324/files/3c677bf7-fe74-49fd-8c3e-f4f824d5d3e3.jpg?v=1791426587',
  heroRightTitle: 'RISE AGAIN HOODIE',
  heroRightDescription:
    '100% premium cotton with roomy oversized streetwear silhouette, structured hood, and custom screen-printed artwork.',
  heroRightBadge: '100% HEAVY COTTON // 840 EGP',
  bannerTitle: 'THE HOODIE AS ARCHITECTURE',
  bannerQuote:
    'We build for bodies that demand weight, proportion, and silent authority in an era of digital distraction.',
  bannerDescription:
    'Every hoodie in Collection 04 is constructed from custom 550 GSM French loopback terry. Double-layered hood volume eliminates drawstrings while maintaining clean vertical posture.',
  bannerImage:
    'https://cdn.shopify.com/s/files/1/0850/3676/1324/files/ef6c4005-f6de-4cf3-9090-9d0bcf45a663.jpg?v=1791430769',
  instapayIpa: 'amr.had@instapay',
  vodafoneCashNumber: '01009608367',
  freeShippingThreshold: 1500,
  shippingFee: 60,
  initialized: true
};

export function sanitizeId(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return cleaned || `item-${Date.now()}`;
}

export async function checkIsAdmin(uid: string | undefined, email: string | null | undefined, emailVerified: boolean | undefined): Promise<boolean> {
  if (!uid || !emailVerified) return false;
  if (email === ROOT_ADMIN_EMAIL) return true;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = 'products';
  const q = query(collection(db, path), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as Product);
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        onError(err as Error);
      }
    }
  );
}

export function subscribeToLookbooks(
  onData: (spreads: LookbookSpread[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = 'lookbooks';
  const q = query(collection(db, path), orderBy('chapter', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as LookbookSpread);
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        onError(err as Error);
      }
    }
  );
}

export function subscribeToStoreSettings(
  onData: (settings: StoreSettings | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = 'storeSettings/main';
  return onSnapshot(
    doc(db, 'storeSettings', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreSettings;
        onData({
          ...data,
          instapayIpa:
            data.instapayIpa === 'orrabit.atelier@instapay'
              ? 'amr.had@instapay'
              : data.instapayIpa,
          vodafoneCashNumber:
            data.vodafoneCashNumber === '01098421104'
              ? '01009608367'
              : data.vodafoneCashNumber
        });
      } else {
        onData(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (err) {
        onError(err as Error);
      }
    }
  );
}

export function subscribeToOrders(
  userId: string,
  isAdminUser: boolean,
  onData: (orders: Order[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = 'orders';
  const q = isAdminUser
    ? query(collection(db, path), orderBy('createdAt', 'desc'))
    : query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Order)
      }));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        onError(err as Error);
      }
    }
  );
}

export async function initializeDatabaseWithCatalog(): Promise<boolean> {
  const settingsRef = doc(db, 'storeSettings', 'main');
  try {
    const existingSettings = await getDocFromServer(settingsRef);
    if (existingSettings.exists() && existingSettings.data()?.initialized) {
      return false; // Already initialized previously — never overwrite or resurrect deleted items
    }

    const batch = writeBatch(db);
    const now = serverTimestamp();

    batch.set(settingsRef, {
      ...DEFAULT_STORE_SETTINGS,
      initialized: true,
      updatedAt: now
    });

    INITIAL_PRODUCTS.forEach((product) => {
      const productId = sanitizeId(product.id);
      const ref = doc(db, 'products', productId);
      const payload: Record<string, unknown> = {
        id: productId,
        name: product.name.slice(0, 200),
        sku: product.sku.slice(0, 64),
        category: product.category,
        price: Number(product.price),
        currency: (product.currency || 'EGP').slice(0, 10),
        color: product.color.slice(0, 80),
        description: product.description.slice(0, 2000),
        composition: product.composition.slice(0, 300),
        origin: product.origin.slice(0, 200),
        fit: product.fit.slice(0, 300),
        care: product.care.slice(0, 300),
        images: product.images.slice(0, 10),
        sizes: product.sizes.slice(0, 10),
        inStockSizes: product.inStockSizes.slice(0, 10),
        featured: Boolean(product.featured),
        isNew: Boolean(product.isNew),
        createdAt: now,
        updatedAt: now
      };
      if (product.editorialKicker) {
        payload.editorialKicker = product.editorialKicker.slice(0, 120);
      }
      batch.set(ref, payload);
    });

    INITIAL_LOOKBOOKS.forEach((spread) => {
      const spreadId = sanitizeId(spread.id);
      const ref = doc(db, 'lookbooks', spreadId);
      batch.set(ref, {
        id: spreadId,
        chapter: spread.chapter.slice(0, 20),
        title: spread.title.slice(0, 200),
        quote: spread.quote.slice(0, 600),
        narrative: spread.narrative.slice(0, 2000),
        primaryImage: spread.primaryImage.slice(0, 500),
        secondaryImage: spread.secondaryImage.slice(0, 500),
        featuredProductIds: spread.featuredProductIds.slice(0, 10),
        createdAt: now,
        updatedAt: now
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'storeSettings/main');
  }
}

export async function createProductInDb(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  const id = sanitizeId(product.id || product.name);
  const path = `products/${id}`;
  const ref = doc(db, 'products', id);

  const payload: Record<string, unknown> = {
    id,
    name: product.name.trim().slice(0, 200),
    sku: product.sku.trim().slice(0, 64),
    category: product.category,
    price: Number(product.price),
    currency: (product.currency || 'EGP').slice(0, 10),
    color: product.color.trim().slice(0, 80),
    description: product.description.trim().slice(0, 2000),
    composition: product.composition.trim().slice(0, 300),
    origin: product.origin.trim().slice(0, 200),
    fit: product.fit.trim().slice(0, 300),
    care: product.care.trim().slice(0, 300),
    images: product.images.filter(Boolean).slice(0, 10),
    sizes: product.sizes.slice(0, 10),
    inStockSizes: product.inStockSizes.slice(0, 10),
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  if (product.editorialKicker && product.editorialKicker.trim()) {
    payload.editorialKicker = product.editorialKicker.trim().slice(0, 120);
  }

  try {
    await setDoc(ref, payload);
    return { ...product, id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProductInDb(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  const ref = doc(db, 'products', product.id);

  const payload: Record<string, unknown> = {
    name: product.name.trim().slice(0, 200),
    sku: product.sku.trim().slice(0, 64),
    category: product.category,
    price: Number(product.price),
    currency: (product.currency || 'EGP').slice(0, 10),
    color: product.color.trim().slice(0, 80),
    description: product.description.trim().slice(0, 2000),
    composition: product.composition.trim().slice(0, 300),
    origin: product.origin.trim().slice(0, 200),
    fit: product.fit.trim().slice(0, 300),
    care: product.care.trim().slice(0, 300),
    images: product.images.filter(Boolean).slice(0, 10),
    sizes: product.sizes.slice(0, 10),
    inStockSizes: product.inStockSizes.slice(0, 10),
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    editorialKicker: product.editorialKicker ? product.editorialKicker.trim().slice(0, 120) : '',
    updatedAt: serverTimestamp()
  };

  try {
    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createLookbookInDb(spread: Omit<LookbookSpread, 'createdAt' | 'updatedAt'>): Promise<LookbookSpread> {
  const id = sanitizeId(spread.id || spread.title);
  const path = `lookbooks/${id}`;
  const ref = doc(db, 'lookbooks', id);

  try {
    await setDoc(ref, {
      id,
      chapter: spread.chapter.trim().slice(0, 20),
      title: spread.title.trim().slice(0, 200),
      quote: spread.quote.trim().slice(0, 600),
      narrative: spread.narrative.trim().slice(0, 2000),
      primaryImage: spread.primaryImage.trim().slice(0, 500),
      secondaryImage: spread.secondaryImage.trim().slice(0, 500),
      featuredProductIds: spread.featuredProductIds.slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { ...spread, id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLookbookInDb(spread: LookbookSpread): Promise<void> {
  const path = `lookbooks/${spread.id}`;
  const ref = doc(db, 'lookbooks', spread.id);

  try {
    await updateDoc(ref, {
      chapter: spread.chapter.trim().slice(0, 20),
      title: spread.title.trim().slice(0, 200),
      quote: spread.quote.trim().slice(0, 600),
      narrative: spread.narrative.trim().slice(0, 2000),
      primaryImage: spread.primaryImage.trim().slice(0, 500),
      secondaryImage: spread.secondaryImage.trim().slice(0, 500),
      featuredProductIds: spread.featuredProductIds.slice(0, 10),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLookbookFromDb(spreadId: string): Promise<void> {
  const path = `lookbooks/${spreadId}`;
  try {
    await deleteDoc(doc(db, 'lookbooks', spreadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStoreSettingsInDb(settings: StoreSettings): Promise<void> {
  const path = 'storeSettings/main';
  const ref = doc(db, 'storeSettings', 'main');

  try {
    await setDoc(ref, {
      heroEyebrow: settings.heroEyebrow.trim().slice(0, 120),
      heroSeason: settings.heroSeason.trim().slice(0, 120),
      heroTitle: settings.heroTitle.trim().slice(0, 120),
      heroQuote: settings.heroQuote.trim().slice(0, 500),
      heroDescription: settings.heroDescription.trim().slice(0, 1000),
      heroLeftImage: settings.heroLeftImage.trim().slice(0, 500),
      heroLeftLabel: settings.heroLeftLabel.trim().slice(0, 120),
      heroLeftPrice: settings.heroLeftPrice.trim().slice(0, 40),
      heroRightImage: settings.heroRightImage.trim().slice(0, 500),
      heroRightTitle: settings.heroRightTitle.trim().slice(0, 120),
      heroRightDescription: settings.heroRightDescription.trim().slice(0, 500),
      heroRightBadge: settings.heroRightBadge.trim().slice(0, 120),
      bannerTitle: settings.bannerTitle.trim().slice(0, 160),
      bannerQuote: settings.bannerQuote.trim().slice(0, 500),
      bannerDescription: settings.bannerDescription.trim().slice(0, 1000),
      bannerImage: settings.bannerImage.trim().slice(0, 500),
      instapayIpa: settings.instapayIpa.trim().slice(0, 120),
      vodafoneCashNumber: settings.vodafoneCashNumber.trim().slice(0, 30),
      freeShippingThreshold: Number(settings.freeShippingThreshold),
      shippingFee: Number(settings.shippingFee),
      initialized: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createOrderInDb(order: Omit<Order, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const currentUser = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const orderId = sanitizeId(`${order.orderNumber}-${Date.now()}`);
  const path = `orders/${orderId}`;

  try {
    await setDoc(doc(db, 'orders', orderId), {
      orderNumber: order.orderNumber.slice(0, 64),
      userId: currentUser.uid,
      firstName: order.firstName.trim().slice(0, 80),
      lastName: order.lastName.trim().slice(0, 80),
      email: order.email.trim().slice(0, 160),
      phone: order.phone.trim().slice(0, 30),
      address: order.address.trim().slice(0, 240),
      city: order.city.trim().slice(0, 80),
      postalCode: order.postalCode.trim().slice(0, 30),
      country: order.country.trim().slice(0, 80),
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference.trim().slice(0, 160),
      items: order.items.slice(0, 30),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusInDb(orderId: string, status: OrderStatus): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
