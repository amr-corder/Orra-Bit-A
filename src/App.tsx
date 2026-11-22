/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, ROOT_ADMIN_EMAIL } from './firebase';
import { supabase, SupabaseUser, isSupabaseAdminUser } from './utils/supabase';
import {
  DEFAULT_STORE_SETTINGS,
  checkIsAdmin,
  subscribeToProducts,
  subscribeToLookbooks,
  subscribeToStoreSettings,
  initializeDatabaseWithCatalog
} from './services/firestoreService';
import { subscribeToOrders } from './services/supabaseOrderService';
import { claimAdminSession, releaseAdminSession } from './services/adminSessionService';
import {
  ActivePage,
  Product,
  ProductSize,
  CartItem,
  Category,
  SortOption,
  ViewLayout,
  LookbookSpread,
  StoreSettings,
  Order
} from './types';
import { Header } from './components/Header';
import { CampaignHero } from './components/CampaignHero';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { CheckoutModal } from './components/CheckoutModal';
import { CheckoutLoadingOverlay } from './components/CheckoutLoadingOverlay';
import { LookbookSection } from './components/LookbookSection';
import { MonographModal } from './components/MonographModal';
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
import { Footer } from './components/Footer';
import { ScrollReveal } from './components/ScrollReveal';
import {
  Language,
  LANGUAGE_STORAGE_KEY,
  STORE_STRINGS,
  translateCategory,
  translateProduct,
  translateStoreSettings
} from './utils/i18n';
import { ArrowRight, Loader2, AlertCircle, Database, X } from 'lucide-react';

const CART_STORAGE_KEY = 'orra_bit_cart_v1';
const WISHLIST_STORAGE_KEY = 'orra_bit_wishlist_v1';
const DARK_MODE_STORAGE_KEY = 'orra_bit_dark_mode_v1';

export default function App() {
  // Language State (Storefront bilingual EN/AR; Admin Dashboard remains EN/LTR)
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === 'ar' || saved === 'en') {
          return saved;
        }
      } catch {
        // Ignore storage errors
      }
    }
    return 'en';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
      } catch {
        // Ignore storage errors
      }
    }
    return false;
  });

  // Navigation Page State
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.pathname === '/admin-login' ||
        window.location.search.includes('page=dashboard')
      ) {
        return 'dashboard';
      }
    }
    return 'storefront';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname === '/admin-login' ||
        window.location.search.includes('page=dashboard')
      ) {
        setActivePage('dashboard');
      } else {
        setActivePage('storefront');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (page: ActivePage) => {
    if (typeof window !== 'undefined') {
      const targetPath = page === 'dashboard' ? '/admin-login' : '/';
      if (window.location.pathname !== targetPath || window.location.search) {
        window.history.pushState({}, '', targetPath);
      }
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      const isStorefrontArabic = activePage === 'storefront' && language === 'ar';
      document.documentElement.dir = isStorefrontArabic ? 'rtl' : 'ltr';
      document.documentElement.lang = activePage === 'dashboard' ? 'en' : language;
    }
  }, [language, activePage]);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
    } catch {
      // Ignore storage errors
    }
  }, [isDarkMode]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const tCatalog = STORE_STRINGS[language].catalog;

  // Auth State (Firebase + Supabase Admin Auth)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseAuthReady, setFirebaseAuthReady] = useState(false);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);

  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [supabaseAuthReady, setSupabaseAuthReady] = useState(false);
  const [isSupabaseAdmin, setIsSupabaseAdmin] = useState(false);

  const authReady = firebaseAuthReady && supabaseAuthReady;
  const isAdminUser = isSupabaseAdmin || isFirebaseAdmin;

  // Live Store Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [lookbooks, setLookbooks] = useState<LookbookSpread[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const autoSeedAttemptedRef = useRef(false);
  const signInInFlightRef = useRef<Promise<void> | null>(null);

  // Filter & View State
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid-4');
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted Client Bag & Wishlist State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Product[]) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const checkoutTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMonographOpen, setIsMonographOpen] = useState(false);

  useEffect(
    () => () => {
      if (checkoutTransitionTimeoutRef.current) {
        clearTimeout(checkoutTransitionTimeoutRef.current);
      }
    },
    []
  );

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCheckoutLoading(true);
    checkoutTransitionTimeoutRef.current = setTimeout(() => {
      setCheckoutLoading(false);
      setIsCheckoutOpen(true);
      checkoutTransitionTimeoutRef.current = null;
    }, 700);
  };

  // Toast notification & Bag 20s alert dot
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isToastDismissible, setIsToastDismissible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isBagAlertActive, setIsBagAlertActive] = useState(false);
  const bagAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, autoDismiss = false) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(message);
    setIsToastDismissible(!autoDismiss);
    if (autoDismiss) {
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        toastTimerRef.current = null;
      }, 7000);
    }
  };

  const triggerBagAlert = () => {
    if (bagAlertTimerRef.current) {
      clearTimeout(bagAlertTimerRef.current);
    }
    setIsBagAlertActive(true);
    bagAlertTimerRef.current = setTimeout(() => {
      setIsBagAlertActive(false);
      bagAlertTimerRef.current = null;
    }, 20000);
  };

  // Persist cart & wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore storage quota issues
    }
  }, [wishlist]);

  // Synchronize Cart & Wishlist with live Firestore product updates/deletions
  useEffect(() => {
    if (!productsLoaded) return;
    const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

    setCart((prev) =>
      prev
        .filter((item) => productMap.has(item.product.id))
        .map((item) => ({
          ...item,
          product: productMap.get(item.product.id) || item.product
        }))
    );

    setWishlist((prev) =>
      prev
        .filter((item) => productMap.has(item.id))
        .map((item) => productMap.get(item.id) || item)
    );

    setSelectedProduct((prev) => (prev ? productMap.get(prev.id) || null : null));
  }, [products, productsLoaded]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminFlag = await checkIsAdmin(user.uid, user.email, user.emailVerified);
        setIsFirebaseAdmin(adminFlag);
      } else {
        setIsFirebaseAdmin(false);
      }
      setFirebaseAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Supabase Auth Session & Listener
  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        let user = data.session?.user ?? null;
        if (isSupabaseAdminUser(user)) {
          try {
            const claimed = await claimAdminSession();
            if (!claimed) {
              throw new Error(
                'Admin account is already active on another device. Sign out from that device first.'
              );
            }
          } catch (error) {
            await supabase.auth.signOut({ scope: 'local' });
            user = null;
            if (active) {
              setDbError(
                `Could not restore the admin session: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          }
        }
        if (!active) return;
        setSupabaseUser(user);
        setIsSupabaseAdmin(isSupabaseAdminUser(user));
        setSupabaseAuthReady(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSupabaseUser(null);
        setIsSupabaseAdmin(false);
        setSupabaseAuthReady(true);
        setDbError(
          `Could not verify the admin session: ${error instanceof Error ? error.message : String(error)}`
        );
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') return;
      const user = session?.user ?? null;
      setSupabaseUser(user);
      setIsSupabaseAdmin(isSupabaseAdminUser(user));
      if (event === 'SIGNED_OUT') setSupabaseAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseAdmin) return;

    const renewAdminSession = async () => {
      try {
        const claimed = await claimAdminSession();
        if (claimed) return;

        await supabase.auth.signOut({ scope: 'local' });
        setSupabaseUser(null);
        setIsSupabaseAdmin(false);
        setDbError('Your admin session was signed out because it became active on another device.');
      } catch (error) {
        setDbError(
          `Could not renew the admin session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };

    const intervalId = window.setInterval(() => {
      void renewAdminSession();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [isSupabaseAdmin]);

  // Real-time Public Storefront Firestore Listeners
  useEffect(() => {
    const unsubProducts = subscribeToProducts(
      (list) => {
        setProducts(list);
        setProductsLoaded(true);
      },
      (err) => {
        setDbError(`Failed to load products from database: ${err.message}`);
        setProductsLoaded(true);
      }
    );

    const unsubLookbooks = subscribeToLookbooks(
      (list) => {
        setLookbooks(list);
      },
      (err) => {
        setDbError(`Failed to load lookbooks from database: ${err.message}`);
      }
    );

    const unsubSettings = subscribeToStoreSettings(
      (settings) => {
        setStoreSettings(settings);
        setSettingsLoaded(true);
      },
      (err) => {
        setDbError(`Failed to load store settings: ${err.message}`);
        setSettingsLoaded(true);
      }
    );

    return () => {
      unsubProducts();
      unsubLookbooks();
      unsubSettings();
    };
  }, []);

  // Real-time Orders Listener (Supabase admins only)
  useEffect(() => {
    if (!supabaseAuthReady || !isSupabaseAdmin) {
      setOrders([]);
      return;
    }

    const unsubOrders = subscribeToOrders(
      (list) => {
        setOrders(list);
      },
      (err) => setDbError(`Failed to load orders: ${err.message}`)
    );

    return () => unsubOrders();
  }, [supabaseAuthReady, isSupabaseAdmin]);

  // Auto-initialize Firestore once when verified Firebase Admin logs in and storeSettings is null
  useEffect(() => {
    if (
      firebaseAuthReady &&
      isFirebaseAdmin &&
      settingsLoaded &&
      storeSettings === null &&
      !autoSeedAttemptedRef.current
    ) {
      autoSeedAttemptedRef.current = true;
      initializeDatabaseWithCatalog()
        .then((created) => {
          if (created) {
            showToast('Database initialized and catalog saved successfully');
          }
        })
        .catch((err) => {
          setDbError(`Failed to initialize catalog in database: ${err instanceof Error ? err.message : String(err)}`);
        });
    }
  }, [firebaseAuthReady, isFirebaseAdmin, settingsLoaded, storeSettings]);

  const handleSupabaseSignIn = async (email: string, password: string) => {
    if (email.trim().toLowerCase() !== ROOT_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Only ${ROOT_ADMIN_EMAIL} is authorized to sign in as an admin.`);
    }

    setIsSupabaseAdmin(false);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      throw error;
    }
    const user = data.user ?? null;
    if (isSupabaseAdminUser(user)) {
      try {
        const claimed = await claimAdminSession();
        if (!claimed) {
          throw new Error(
            'Admin account is already active on another device. Sign out from that device first.'
          );
        }
      } catch (sessionError) {
        await supabase.auth.signOut({ scope: 'local' });
        throw new Error(
          `Could not start the admin session: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`
        );
      }
    }
    setSupabaseUser(user);
    setIsSupabaseAdmin(isSupabaseAdminUser(user));
  };

  const handleSignIn = async () => {
    if (signInInFlightRef.current) {
      return signInInFlightRef.current;
    }
    const promise = signInWithPopup(auth, googleProvider)
      .then(async ({ user }) => {
        if (user.email?.toLowerCase() !== ROOT_ADMIN_EMAIL.toLowerCase()) {
          await signOut(auth);
          throw new Error(`Only ${ROOT_ADMIN_EMAIL} is authorized to sign in as an admin.`);
        }
      })
      .finally(() => {
        signInInFlightRef.current = null;
      });
    signInInFlightRef.current = promise;
    return promise;
  };

  const handleSignOut = async () => {
    if (isSupabaseAdminUser(supabaseUser)) {
      try {
        await releaseAdminSession();
      } catch (error) {
        setDbError(
          `Could not release the admin session. You are still signed in: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
      }
    }
    await Promise.allSettled([
      signOut(auth),
      supabase.auth.signOut({ scope: 'local' })
    ]);
    setSupabaseUser(null);
    setIsSupabaseAdmin(false);
    showToast(tCatalog.signedOutToast);
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: ProductSize) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], quantity: copy[existingIdx].quantity + 1 };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `${product.id}-${size}-${Date.now()}`,
            product,
            size,
            quantity: 1
          }
        ];
      }
    });
    const localizedName = translateProduct(product, language).name;
    showToast(`${tCatalog.addedToBagToast}: ${localizedName} (${size})`, true);
    triggerBagAlert();
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    const localizedName = translateProduct(product, language).name;
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`${tCatalog.removedWishlistToast}: ${localizedName}`, true);
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`${tCatalog.savedWishlistToast}: ${localizedName}`, true);
        return [...prev, product];
      }
    });
  };

  const handleMoveFromWishlistToCart = (product: Product, size: ProductSize) => {
    handleAddToCart(product, size);
    setWishlist((prev) => prev.filter((p) => p.id !== product.id));
  };

  // Filter & Sort Logic
  const categories: Category[] = [
    'All',
    'Signature Editions',
    'Graphic Series',
    'Minimalist Oversized',
    'Earthy Tones',
    'Deep Navy'
  ];

  const filteredAndSortedProducts = useMemo(() => {
    const result = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ar = translateProduct(p, 'ar');
        const arCat = translateCategory(p.category, 'ar');
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          ar.name.toLowerCase().includes(q) ||
          ar.description.toLowerCase().includes(q) ||
          ar.color.toLowerCase().includes(q) ||
          arCat.toLowerCase().includes(q)
        );
      }
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) =>
          translateProduct(a, language).name.localeCompare(
            translateProduct(b, language).name,
            language === 'ar' ? 'ar' : 'en'
          )
        );
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, language]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLookbook = () => {
    const el = document.getElementById('lookbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setViewLayout('lookbook');
    }
  };

  const isLoadingDb = !productsLoaded || !settingsLoaded;
  const effectiveSettings = storeSettings || DEFAULT_STORE_SETTINGS;
  const localizedBannerSettings = translateStoreSettings(effectiveSettings, language);
  const needsInitialSeed = !isLoadingDb && storeSettings === null && products.length === 0;

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? 'dark-theme' : 'bg-[#FFFFFF] text-[#0A0A0A]'
      }`}
    >

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 md:top-[88px] left-1/2 -translate-x-1/2 z-[60] w-max max-w-[calc(100vw-2rem)] bg-[#0A0A0A] text-[#FFFFFF] px-5 py-3 border border-[#333] shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]" />
          </span>
          <span className="text-[12px] font-mono tracking-[0.06em] uppercase">
            {toastMessage}
          </span>
          {isToastDismissible && (
            <button
              type="button"
              onClick={() => {
                if (toastTimerRef.current) {
                  clearTimeout(toastTimerRef.current);
                  toastTimerRef.current = null;
                }
                setToastMessage(null);
              }}
              className="shrink-0 p-1 text-[#FFFFFF]/70 hover:text-[#FFFFFF]"
              aria-label={language === 'ar' ? 'إغلاق الإشعار' : 'Dismiss notification'}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        isBagAlertActive={isBagAlertActive}
        wishlistCount={wishlist.length}
        activePage={activePage}
        isAdminUser={isAdminUser}
        onTogglePage={(page) => navigateToPage(page)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setTimeout(scrollToCatalog, 50);
        }}
        onNavigateHome={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLookbook={() => setTimeout(scrollToLookbook, 50)}
        onOpenMonograph={() => setIsMonographOpen(true)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((current) => !current)}
      />

      {/* Global DB Error Banner */}
      {dbError && (
        <div className="bg-[#FFF5F5] border-b border-[#ba1a1a] px-6 md:px-12 py-3 text-[#ba1a1a] text-[12px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{dbError}</span>
          </div>
          <button
            onClick={() => setDbError(null)}
            className="text-[11px] font-mono uppercase underline"
          >
            {tCatalog.dismiss}
          </button>
        </div>
      )}

      <main className="flex-1">
        {activePage === 'dashboard' ? (
          <Suspense
            fallback={
              <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 flex flex-col items-center justify-center text-center">
                <Loader2 size={28} className="animate-spin text-[#0A0A0A] mb-4" />
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#71717A]">
                  Loading Admin Dashboard...
                </p>
              </div>
            }
          >
            <AdminDashboard
              currentUser={currentUser}
              supabaseUser={supabaseUser}
              authReady={authReady}
              isAdminUser={isAdminUser}
              isFirebaseAdmin={isFirebaseAdmin}
              products={products}
              lookbooks={lookbooks}
              storeSettings={storeSettings}
              orders={orders}
              isLoadingDb={isLoadingDb}
              onSupabaseSignIn={handleSupabaseSignIn}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              onBackToStorefront={() => navigateToPage('storefront')}
            />
          </Suspense>
        ) : isLoadingDb ? (
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 flex flex-col items-center justify-center text-center">
            <Loader2 size={28} className="animate-spin text-[#0A0A0A] mb-4" />
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#71717A]">
              {tCatalog.loadingDb}
            </p>
          </div>
        ) : needsInitialSeed ? (
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <div className="border border-[#0A0A0A] bg-[#F9F9F9] p-8 md:p-12 space-y-6">
              <Database size={32} className="mx-auto text-[#0A0A0A]" />
              <div>
                <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#71717A] block mb-2">
                  {tCatalog.dbReadyEyebrow}
                </span>
                <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] mb-3">
                  {tCatalog.dbReadyTitle}
                </h1>
                <p className="text-[13px] text-[#71717A] leading-[22px]">
                  {tCatalog.dbReadyBody}
                </p>
              </div>
              <button
                onClick={() => navigateToPage('dashboard')}
                className="h-12 px-8 bg-[#0A0A0A] text-[#FFFFFF] text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors inline-flex items-center gap-2"
              >
                <span>{tCatalog.openDashboard}</span>
                <ArrowRight size={15} className="rtl:rotate-180" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Campaign Hero Showcase */}
            <CampaignHero
              settings={effectiveSettings}
              onExploreCatalog={scrollToCatalog}
              onViewLookbook={scrollToLookbook}
              language={language}
              isDarkMode={isDarkMode}
            />

            {/* Catalog & Filter Section */}
            <div id="catalog-section" className="scroll-mt-[64px] md:scroll-mt-[72px]">
              <ScrollReveal>
                <FilterBar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categories={categories}
                  itemCount={filteredAndSortedProducts.length}
                  totalCount={products.length}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewLayout={viewLayout}
                  onViewLayoutChange={setViewLayout}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                  language={language}
                />
              </ScrollReveal>

              {/* Catalog Layout Views */}
              {viewLayout === 'lookbook' ? (
                <LookbookSection
                  spreads={lookbooks}
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  language={language}
                />
              ) : (
                <section className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-12 py-10 md:py-16">
                  {/* Category Lead In */}
                  <ScrollReveal>
                    <div className="mb-8 flex items-end justify-between border-b border-[#E4E4E7] pb-4">
                      <div>
                        <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-[#71717A] block mb-1">
                          {tCatalog.archivePrefix} / {translateCategory(selectedCategory, language).toUpperCase()}
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A]">
                          {selectedCategory === 'All'
                            ? tCatalog.permanentCollection
                            : language === 'ar'
                              ? `${tCatalog.architectureSuffix} ${translateCategory(selectedCategory, language)}`
                              : `${selectedCategory} ${tCatalog.architectureSuffix}`}
                        </h2>
                      </div>

                      <div className="hidden sm:block text-end">
                        <span className="text-[11px] font-mono tracking-[0.1em] text-[#71717A] uppercase">
                          {tCatalog.framingLabel} · {filteredAndSortedProducts.length} {tCatalog.pieces}
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Product Grid */}
                  {filteredAndSortedProducts.length === 0 ? (
                    <div className="py-24 text-center border border-[#E4E4E7] bg-[#F9F9F9] p-8">
                      <span className="font-serif text-3xl text-[#0A0A0A] block mb-2">
                        {products.length === 0 ? tCatalog.noPiecesTitle : tCatalog.noMatchingTitle}
                      </span>
                      <p className="text-[13px] text-[#71717A] max-w-sm mx-auto mb-6">
                        {products.length === 0
                          ? tCatalog.noPiecesBody
                          : tCatalog.noMatchingBody}
                      </p>
                      {products.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedCategory('All');
                            setSearchQuery('');
                          }}
                          className="h-11 px-6 bg-[#0A0A0A] text-white text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors"
                        >
                          {tCatalog.resetFilters}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigateToPage('dashboard')}
                          className="h-11 px-6 bg-[#0A0A0A] text-white text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors"
                        >
                          {tCatalog.addInAdmin}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`grid gap-3 sm:gap-6 md:gap-8 ${
                        viewLayout === 'grid-3'
                          ? 'grid-cols-2 lg:grid-cols-3'
                          : 'grid-cols-2 lg:grid-cols-4'
                      }`}
                    >
                      {filteredAndSortedProducts.map((product, index) => (
                        <ScrollReveal
                          key={product.id}
                          delay={(index % 4) * 70}
                          className="h-full flex"
                        >
                          <div className="w-full flex flex-col">
                            <ProductCard
                              product={product}
                              isWishlisted={wishlist.some((p) => p.id === product.id)}
                              onToggleWishlist={handleToggleWishlist}
                              onQuickAdd={handleAddToCart}
                              onSelectProduct={(p) => setSelectedProduct(p)}
                              language={language}
                            />
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Integrated Lookbook Monograph Spread (if not in lookbook mode already) */}
              {viewLayout !== 'lookbook' && (
                <LookbookSection
                  spreads={lookbooks}
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  language={language}
                />
              )}

              {/* Curated Editorial Spotlight Banner */}
              <section className="w-full bg-[#0A0A0A] text-[#FFFFFF] py-16 md:py-24 px-6 md:px-12 border-t border-[#E4E4E7]">
                <ScrollReveal>
                  <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                      <span className="text-[11px] font-mono tracking-[0.2em] text-[#858383] uppercase block">
                        {tCatalog.manufacturingEssay}
                      </span>
                      <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] leading-[1.1]">
                        {localizedBannerSettings.bannerTitle}
                      </h3>
                      <p className="font-serif text-xl italic text-[#c9c6c5] max-w-xl">
                        “{localizedBannerSettings.bannerQuote}”
                      </p>
                      <p className="text-[13px] text-[#858383] leading-[22px] max-w-lg">
                        {localizedBannerSettings.bannerDescription}
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => setIsMonographOpen(true)}
                          className="h-12 px-8 bg-transparent text-[#FFFFFF] border border-[#FFFFFF] text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-[#FFFFFF] hover:text-[#0A0A0A] transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>{tCatalog.readMonograph}</span>
                          <ArrowRight size={15} className="rtl:rotate-180" />
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <div className="aspect-[4/5] border border-[#27272A] bg-[#141418] overflow-hidden">
                        <img
                          src={effectiveSettings.bannerImage}
                          alt={localizedBannerSettings.bannerTitle}
                          className="w-full h-full object-cover object-center"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </section>
            </div>
          </>
        )}
      </main>

      {/* Global Footer */}
      <ScrollReveal>
        <Footer
          onSelectCategory={(cat) => {
            navigateToPage('storefront');
            setSelectedCategory(cat);
            setTimeout(scrollToCatalog, 50);
          }}
          onOpenLookbook={() => {
            navigateToPage('storefront');
            setTimeout(scrollToLookbook, 50);
          }}
          onOpenMonograph={() => setIsMonographOpen(true)}
          onOpenAdminLogin={() => navigateToPage('dashboard')}
          language={language}
        />
      </ScrollReveal>

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProduct ? wishlist.some((p) => p.id === selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        language={language}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        freeShippingThreshold={effectiveSettings.freeShippingThreshold}
        shippingFee={effectiveSettings.shippingFee}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={(itemId) => handleRemoveFromCart(itemId)}
        onProceedToCheckout={handleProceedToCheckout}
        onOpenProduct={(item) => setSelectedProduct(item.product)}
        language={language}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveFromWishlistToCart}
        onSelectProduct={(p) => setSelectedProduct(p)}
        language={language}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onApplySearchFilter={(query) => {
          navigateToPage('storefront');
          setSearchQuery(query);
          setTimeout(scrollToCatalog, 50);
        }}
        language={language}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        storeSettings={effectiveSettings}
        onOrderCompleted={() => setCart([])}
        language={language}
      />
      {checkoutLoading && (
        <CheckoutLoadingOverlay
          message={STORE_STRINGS[language].checkout.loadingCheckout}
          language={language}
        />
      )}

      {/* Monograph & Philosophy Modal */}
      <MonographModal
        isOpen={isMonographOpen}
        onClose={() => setIsMonographOpen(false)}
        onExploreCollection={() => {
          navigateToPage('storefront');
          setTimeout(scrollToCatalog, 50);
        }}
        language={language}
      />
    </div>
  );
}
