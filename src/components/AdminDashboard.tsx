import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  LogIn,
  LogOut,
  Package,
  BookOpen,
  Settings,
  ShoppingBag,
  ArrowLeft,
  Database,
  Search,
  ExternalLink,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Product,
  ProductSize,
  Category,
  LookbookSpread,
  StoreSettings,
  Order,
  OrderStatus
} from '../types';
import {
  DEFAULT_STORE_SETTINGS,
  sanitizeId,
  initializeDatabaseWithCatalog,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  createLookbookInDb,
  updateLookbookInDb,
  deleteLookbookFromDb,
  saveStoreSettingsInDb
} from '../services/firestoreService';
import { updateOrderStatusInDb, deleteOrderFromDb } from '../services/supabaseOrderService';
import { ROOT_ADMIN_EMAIL, formatFirebaseAuthError } from '../firebase';
import {
  SupabaseUser,
  formatSupabaseAuthError,
  isSupabaseAdminUser
} from '../utils/supabase';

interface AdminDashboardProps {
  currentUser: User | null;
  supabaseUser: SupabaseUser | null;
  authReady: boolean;
  isAdminUser: boolean;
  isFirebaseAdmin: boolean;
  products: Product[];
  lookbooks: LookbookSpread[];
  storeSettings: StoreSettings | null;
  orders: Order[];
  isLoadingDb: boolean;
  onSupabaseSignIn: (email: string, password: string) => Promise<void>;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onBackToStorefront: () => void;
}

type AdminTab = 'products' | 'lookbooks' | 'settings' | 'orders';

const ALL_CATEGORIES: Exclude<Category, 'All'>[] = [
  'Signature Editions',
  'Graphic Series',
  'Minimalist Oversized',
  'Earthy Tones',
  'Deep Navy'
];

const ALL_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

interface ProductFormState {
  id: string;
  name: string;
  sku: string;
  category: Exclude<Category, 'All'>;
  price: string;
  color: string;
  editorialKicker: string;
  description: string;
  composition: string;
  origin: string;
  fit: string;
  care: string;
  imagesText: string;
  sizes: ProductSize[];
  inStockSizes: ProductSize[];
  featured: boolean;
  isNew: boolean;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  id: '',
  name: '',
  sku: '',
  category: 'Signature Editions',
  price: '840',
  color: 'Jet Black',
  editorialKicker: '',
  description: '',
  composition: '100% Heavyweight Egyptian Cotton (550 GSM)',
  origin: 'Crafted in Cairo / Ovaen Studio',
  fit: 'Relaxed Dropped-Shoulder Streetwear Cut',
  care: 'Machine wash cold inside out. Hang dry.',
  imagesText: '',
  sizes: ['S', 'M', 'L', 'XL'],
  inStockSizes: ['S', 'M', 'L', 'XL'],
  featured: false,
  isNew: true
};

interface LookbookFormState {
  id: string;
  chapter: string;
  title: string;
  quote: string;
  narrative: string;
  primaryImage: string;
  secondaryImage: string;
  featuredProductIds: string[];
}

const EMPTY_LOOKBOOK_FORM: LookbookFormState = {
  id: '',
  chapter: '04',
  title: '',
  quote: '',
  narrative: '',
  primaryImage: '',
  secondaryImage: '',
  featuredProductIds: []
};

function extractFriendlyError(err: unknown): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed?.error) return String(parsed.error);
    } catch {
      return err.message;
    }
    return err.message;
  }
  return 'An unexpected error occurred while connecting to the database.';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  supabaseUser,
  authReady,
  isAdminUser,
  isFirebaseAdmin,
  products,
  lookbooks,
  storeSettings,
  orders,
  isLoadingDb,
  onSupabaseSignIn,
  onSignIn,
  onSignOut,
  onBackToStorefront
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [authLoading, setAuthLoading] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPopupAuthIssue, setIsPopupAuthIssue] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const justLinkedGoogleRef = React.useRef(false);

  const notifySuccess = React.useCallback((text: string) => {
    setFeedback({ type: 'success', text });
  }, []);

  const notifyError = React.useCallback((text: string) => {
    setFeedback({ type: 'error', text });
  }, []);

  useEffect(() => {
    if (isFirebaseAdmin && justLinkedGoogleRef.current) {
      justLinkedGoogleRef.current = false;
      notifySuccess(
        'Google Firestore session linked successfully. Full database write permissions and live orders sync are now active.'
      );
    }
  }, [isFirebaseAdmin, notifySuccess]);

  // Products state
  const [productSearch, setProductSearch] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Lookbooks state
  const [isLookbookFormOpen, setIsLookbookFormOpen] = useState(false);
  const [editingLookbookId, setEditingLookbookId] = useState<string | null>(null);
  const [lookbookForm, setLookbookForm] = useState<LookbookFormState>(EMPTY_LOOKBOOK_FORM);
  const [savingLookbook, setSavingLookbook] = useState(false);
  const [confirmDeleteLookbookId, setConfirmDeleteLookbookId] = useState<string | null>(null);
  const [deletingLookbookId, setDeletingLookbookId] = useState<string | null>(null);

  // Store settings state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(
    storeSettings || DEFAULT_STORE_SETTINGS
  );
  const [savingSettings, setSavingSettings] = useState(false);

  // Orders state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (storeSettings) {
      setSettingsForm(storeSettings);
    }
  }, [storeSettings]);

  useEffect(() => {
    if (!isProductFormOpen && !isLookbookFormOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isProductFormOpen && !savingProduct) setIsProductFormOpen(false);
      if (isLookbookFormOpen && !savingLookbook) setIsLookbookFormOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProductFormOpen, savingProduct, isLookbookFormOpen, savingLookbook]);

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseEmail.trim() || !supabasePassword) {
      notifyError('Please enter both your email address and password.');
      return;
    }
    setSupabaseLoading(true);
    setFeedback(null);
    setIsPopupAuthIssue(false);
    try {
      await onSupabaseSignIn(supabaseEmail, supabasePassword);
      setSupabasePassword('');
    } catch (err) {
      notifyError(formatSupabaseAuthError(err));
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setFeedback(null);
    setIsPopupAuthIssue(false);
    justLinkedGoogleRef.current = true;
    try {
      await onSignIn();
    } catch (err) {
      justLinkedGoogleRef.current = false;
      const formatted = formatFirebaseAuthError(err);
      setIsPopupAuthIssue(formatted.isPopupIssue);
      notifyError(formatted.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInitializeCatalog = async () => {
    setInitLoading(true);
    setFeedback(null);
    try {
      const created = await initializeDatabaseWithCatalog();
      if (created) {
        notifySuccess('Initial catalog (16 hoodies, 3 lookbook spreads, and store settings) saved to the database.');
      } else {
        notifySuccess('Database is already initialized.');
      }
    } catch (err) {
      notifyError(`Failed to initialize database: ${extractFriendlyError(err)}`);
    } finally {
      setInitLoading(false);
    }
  };

  // --- Product Handlers ---
  const openAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      ...EMPTY_PRODUCT_FORM,
      sku: `OV-HD-${String(products.length + 1).padStart(3, '0')}`
    });
    setIsProductFormOpen(true);
    setFeedback(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      color: product.color,
      editorialKicker: product.editorialKicker || '',
      description: product.description,
      composition: product.composition,
      origin: product.origin,
      fit: product.fit,
      care: product.care,
      imagesText: product.images.join('\n'),
      sizes: product.sizes,
      inStockSizes: product.inStockSizes,
      featured: Boolean(product.featured),
      isNew: Boolean(product.isNew)
    });
    setIsProductFormOpen(true);
    setFeedback(null);
  };

  const handleToggleProductSize = (size: ProductSize) => {
    setProductForm((prev) => {
      const exists = prev.sizes.includes(size);
      const nextSizes = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      const nextInStock = exists
        ? prev.inStockSizes.filter((s) => s !== size)
        : [...prev.inStockSizes, size];
      return { ...prev, sizes: nextSizes, inStockSizes: nextInStock };
    });
  };

  const handleToggleInStockSize = (size: ProductSize) => {
    setProductForm((prev) => {
      if (!prev.sizes.includes(size)) return prev;
      const exists = prev.inStockSizes.includes(size);
      return {
        ...prev,
        inStockSizes: exists
          ? prev.inStockSizes.filter((s) => s !== size)
          : [...prev.inStockSizes, size]
      };
    });
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsedImages = productForm.imagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 5 && s.length <= 500);

    const numericPrice = Number(productForm.price);

    if (productForm.name.trim().length < 2) {
      notifyError('Product name must be at least 2 characters.');
      return;
    }
    if (productForm.sku.trim().length < 2) {
      notifyError('Please enter a valid SKU (at least 2 characters).');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      notifyError('Please enter a valid price greater than 0.');
      return;
    }
    if (parsedImages.length === 0) {
      notifyError('Please provide at least one valid image URL (5 to 500 characters).');
      return;
    }
    if (productForm.sizes.length === 0) {
      notifyError('Please select at least one available size.');
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProductId) {
        const updated: Product = {
          id: editingProductId,
          name: productForm.name.trim(),
          sku: productForm.sku.trim(),
          category: productForm.category,
          price: numericPrice,
          currency: 'EGP',
          color: productForm.color.trim(),
          editorialKicker: productForm.editorialKicker.trim(),
          description: productForm.description.trim(),
          composition: productForm.composition.trim(),
          origin: productForm.origin.trim(),
          fit: productForm.fit.trim(),
          care: productForm.care.trim(),
          images: parsedImages,
          sizes: productForm.sizes,
          inStockSizes: productForm.inStockSizes,
          featured: productForm.featured,
          isNew: productForm.isNew
        };
        await updateProductInDb(updated);
        notifySuccess(`Product "${updated.name}" updated in the database.`);
      } else {
        const newId = sanitizeId(productForm.id || `${productForm.name}-${Date.now()}`);
        const created: Omit<Product, 'createdAt' | 'updatedAt'> = {
          id: newId,
          name: productForm.name.trim(),
          sku: productForm.sku.trim(),
          category: productForm.category,
          price: numericPrice,
          currency: 'EGP',
          color: productForm.color.trim(),
          editorialKicker: productForm.editorialKicker.trim() || undefined,
          description: productForm.description.trim(),
          composition: productForm.composition.trim(),
          origin: productForm.origin.trim(),
          fit: productForm.fit.trim(),
          care: productForm.care.trim(),
          images: parsedImages,
          sizes: productForm.sizes,
          inStockSizes: productForm.inStockSizes,
          featured: productForm.featured,
          isNew: productForm.isNew
        };
        await createProductInDb(created);
        notifySuccess(`Product "${created.name}" added and saved to the database.`);
      }
      setIsProductFormOpen(false);
      setEditingProductId(null);
    } catch (err) {
      notifyError(`Failed to save product: ${extractFriendlyError(err)}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    setDeletingProductId(product.id);
    setFeedback(null);
    try {
      await deleteProductFromDb(product.id);
      setConfirmDeleteProductId(null);
      notifySuccess(`Product "${product.name}" permanently deleted from the database.`);
    } catch (err) {
      notifyError(`Failed to delete product: ${extractFriendlyError(err)}`);
    } finally {
      setDeletingProductId(null);
    }
  };

  // --- Lookbook Handlers ---
  const openAddLookbook = () => {
    setEditingLookbookId(null);
    setLookbookForm({
      ...EMPTY_LOOKBOOK_FORM,
      chapter: String(lookbooks.length + 1).padStart(2, '0')
    });
    setIsLookbookFormOpen(true);
    setFeedback(null);
  };

  const openEditLookbook = (spread: LookbookSpread) => {
    setEditingLookbookId(spread.id);
    setLookbookForm({
      id: spread.id,
      chapter: spread.chapter,
      title: spread.title,
      quote: spread.quote,
      narrative: spread.narrative,
      primaryImage: spread.primaryImage,
      secondaryImage: spread.secondaryImage,
      featuredProductIds: spread.featuredProductIds
    });
    setIsLookbookFormOpen(true);
    setFeedback(null);
  };

  const handleSubmitLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (lookbookForm.title.trim().length < 2 || lookbookForm.quote.trim().length < 2 || lookbookForm.narrative.trim().length < 2) {
      notifyError('Please complete the spread title, editorial quote, and narrative (minimum 2 characters each).');
      return;
    }
    if (lookbookForm.primaryImage.trim().length < 5 || lookbookForm.secondaryImage.trim().length < 5) {
      notifyError('Please enter valid primary and secondary image URLs.');
      return;
    }

    setSavingLookbook(true);
    try {
      if (editingLookbookId) {
        await updateLookbookInDb({
          id: editingLookbookId,
          chapter: lookbookForm.chapter.trim(),
          title: lookbookForm.title.trim(),
          quote: lookbookForm.quote.trim(),
          narrative: lookbookForm.narrative.trim(),
          primaryImage: lookbookForm.primaryImage.trim(),
          secondaryImage: lookbookForm.secondaryImage.trim(),
          featuredProductIds: lookbookForm.featuredProductIds
        });
        notifySuccess(`Lookbook spread "${lookbookForm.title}" updated in the database.`);
      } else {
        const id = sanitizeId(lookbookForm.id || `spread-${lookbookForm.chapter}-${Date.now()}`);
        await createLookbookInDb({
          id,
          chapter: lookbookForm.chapter.trim(),
          title: lookbookForm.title.trim(),
          quote: lookbookForm.quote.trim(),
          narrative: lookbookForm.narrative.trim(),
          primaryImage: lookbookForm.primaryImage.trim(),
          secondaryImage: lookbookForm.secondaryImage.trim(),
          featuredProductIds: lookbookForm.featuredProductIds
        });
        notifySuccess(`Lookbook spread "${lookbookForm.title}" added to the database.`);
      }
      setIsLookbookFormOpen(false);
      setEditingLookbookId(null);
    } catch (err) {
      notifyError(`Failed to save lookbook spread: ${extractFriendlyError(err)}`);
    } finally {
      setSavingLookbook(false);
    }
  };

  const handleDeleteLookbook = async (spread: LookbookSpread) => {
    setDeletingLookbookId(spread.id);
    setFeedback(null);
    try {
      await deleteLookbookFromDb(spread.id);
      setConfirmDeleteLookbookId(null);
      notifySuccess(`Lookbook spread "${spread.title}" permanently deleted from the database.`);
    } catch (err) {
      notifyError(`Failed to delete lookbook spread: ${extractFriendlyError(err)}`);
    } finally {
      setDeletingLookbookId(null);
    }
  };

  // --- Store Settings Handler ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedback(null);
    try {
      await saveStoreSettingsInDb(settingsForm);
      notifySuccess('Storefront and payment settings saved to the database and live for visitors.');
    } catch (err) {
      notifyError(`Failed to save settings: ${extractFriendlyError(err)}`);
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Orders Handlers ---
  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setFeedback(null);
    try {
      await updateOrderStatusInDb(orderId, nextStatus);
      notifySuccess(`Order status updated to "${ORDER_STATUS_LABELS[nextStatus]}".`);
    } catch (err) {
      notifyError(`Failed to update order status: ${extractFriendlyError(err)}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    setDeletingOrderId(orderId);
    setFeedback(null);
    try {
      await deleteOrderFromDb(orderId);
      setConfirmDeleteOrderId(null);
      notifySuccess(`Order ${orderNumber} permanently deleted from the database.`);
    } catch (err) {
      notifyError(`Failed to delete order: ${extractFriendlyError(err)}`);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q)
    );
  });

  const activeUser = supabaseUser || currentUser;
  const activeEmail = supabaseUser?.email || currentUser?.email || '';

  // 1. Auth Loading Gate
  if (!authReady) {
    return (
      <div className="admin-dashboard max-w-[1440px] mx-auto px-6 md:px-12 py-24 flex flex-col items-center justify-center text-center">
        <Loader2 size={28} className="animate-spin text-[#0A0A0A] mb-4" />
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#71717A]">
          Verifying Admin Session & Security Credentials...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!activeUser) {
    return (
      <div className="admin-dashboard max-w-xl mx-auto px-6 py-20">
        <div className="border border-[#E4E4E7] bg-[#FFFFFF] p-8 md:p-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto border border-[#0A0A0A] flex items-center justify-center">
              <Lock size={20} className="text-[#0A0A0A]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#71717A] block mb-2">
                ORRA BIT // ADMIN ACCESS ONLY
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] mb-2">
                Admin Dashboard
              </h1>
              <p className="text-[13px] text-[#71717A] leading-[22px]">
                Restricted to authorized administrators to manage products, lookbooks, payment settings, and orders.
              </p>
            </div>
          </div>

          {feedback && (
            <div className="p-4 border border-[#ba1a1a] bg-[#FFF5F5] text-[#ba1a1a] text-[12px] space-y-3 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feedback.text}</span>
              </div>
              {isPopupAuthIssue && typeof window !== 'undefined' && (
                <a
                  href={`${window.location.origin}${window.location.pathname}?page=dashboard`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 px-4 border border-[#ba1a1a] bg-[#FFFFFF] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.06em] uppercase hover:bg-[#0A0A0A] hover:text-[#FFFFFF] hover:border-[#0A0A0A] transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  <span>Open Admin Dashboard in New Tab to Sign In</span>
                </a>
              )}
            </div>
          )}

          {/* Primary Admin Auth: Supabase Email + Password */}
          <form onSubmit={handleSupabaseLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-[#71717A] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={supabaseEmail}
                  onChange={(e) => setSupabaseEmail(e.target.value)}
                  placeholder="admin@orrabit.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-[#71717A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={supabasePassword}
                  onChange={(e) => setSupabasePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0A0A0A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#0A0A0A] p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={supabaseLoading || authLoading}
              className="w-full h-12 bg-[#0A0A0A] text-[#FFFFFF] text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {supabaseLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In to Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4E4E7]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#A1A1AA]">
              OR
            </span>
            <div className="flex-1 h-px bg-[#E4E4E7]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading || supabaseLoading}
              className="w-full h-11 border border-[#0A0A0A] bg-[#FFFFFF] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Database size={15} />
                  <span>Sign In with Google</span>
                </>
              )}
            </button>

            {typeof window !== 'undefined' && window.self !== window.top && !isPopupAuthIssue && (
              <a
                href={`${window.location.origin}${window.location.pathname}?page=dashboard`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 border border-[#E4E4E7] bg-[#F9F9F9] text-[#0A0A0A] text-[11px] font-mono tracking-[0.06em] hover:border-[#0A0A0A] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={13} />
                <span>Open Dashboard in Standalone Tab if Popup Is Blocked</span>
              </a>
            )}

            <button
              type="button"
              onClick={onBackToStorefront}
              className="w-full h-11 border border-[#E4E4E7] text-[#71717A] text-[11px] font-mono tracking-[0.1em] uppercase hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized User Gate
  if (!isAdminUser) {
    return (
      <div className="admin-dashboard max-w-xl mx-auto px-6 py-20">
        <div className="border border-[#ba1a1a] bg-[#FFFFFF] p-8 md:p-10 space-y-5 text-center">
          <AlertCircle size={32} className="mx-auto text-[#ba1a1a]" />
          <h2 className="font-serif text-3xl text-[#0A0A0A]">Unauthorized Account</h2>
          <p className="text-[13px] text-[#71717A] leading-[22px]">
            Signed in as <span className="font-mono text-[#0A0A0A]">{activeEmail}</span>, however dashboard access and database management are restricted strictly to authorized admin accounts (<span className="font-mono text-[#0A0A0A]">{ROOT_ADMIN_EMAIL}</span>).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onSignOut}
              className="flex-1 h-11 bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Switch Account / Sign Out</span>
            </button>
            <button
              onClick={onBackToStorefront}
              className="flex-1 h-11 border border-[#E4E4E7] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.1em] uppercase hover:border-[#0A0A0A] transition-colors"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Admin Workspace
  return (
    <div className="admin-dashboard max-w-[1440px] mx-auto px-6 md:px-12 py-10 space-y-8">
      {/* Admin Top Header */}
      <div className="border-b border-[#E4E4E7] pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[#71717A] mb-1.5">
            <span>ORRA BIT // ADMIN WORKSPACE</span>
            {isFirebaseAdmin && (
              <>
                <span>/</span>
                <span className="text-[#15803D] flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 bg-[#15803D] inline-block" />
                  Firestore Session Linked • Full Access
                </span>
              </>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A]">
            Admin Dashboard
          </h1>
          <p className="text-[12px] text-[#71717A] mt-1 font-mono">
            Signed in as: {activeEmail}
            {isFirebaseAdmin && currentUser?.email && currentUser.email !== activeEmail
              ? ` • Firestore Google: ${currentUser.email}`
              : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToStorefront}
            className="h-10 px-4 border border-[#0A0A0A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.08em] uppercase hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>View Storefront</span>
          </button>
          <button
            onClick={onSignOut}
            className="h-10 px-4 border border-[#E4E4E7] text-[#71717A] text-[11px] font-semibold tracking-[0.08em] uppercase hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors flex items-center gap-2"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* First-Time Database Initialization Prompt */}
      {!isLoadingDb && !storeSettings?.initialized && isFirebaseAdmin && (
        <div className="border border-[#0A0A0A] bg-[#F9F9F9] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#71717A] block mb-1">
              DATABASE READY FOR FIRST SEED
            </span>
            <h2 className="font-serif text-2xl text-[#0A0A0A]">
              Initialize Database with Core Catalog
            </h2>
            <p className="text-[13px] text-[#71717A] mt-1">
              The database is currently empty. Seed the initial catalog (16 hoodies, 3 lookbook spreads, and store settings) to Firestore with one click.
            </p>
          </div>
          <button
            onClick={handleInitializeCatalog}
            disabled={initLoading}
            className="h-11 px-6 bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {initLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Database size={15} />
                <span>Seed Catalog to Database</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 border space-y-3 ${
            feedback.type === 'success'
              ? 'border-[#15803D] bg-[#F0FDF4] text-[#14532D]'
              : 'border-[#ba1a1a] bg-[#FFF5F5] text-[#ba1a1a]'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[13px]">
              {feedback.type === 'success' ? (
                <Check size={16} className="shrink-0" />
              ) : (
                <AlertCircle size={16} className="shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[11px] font-mono uppercase underline hover:opacity-60 transition-opacity shrink-0"
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
          {feedback.type === 'error' && isPopupAuthIssue && typeof window !== 'undefined' && (
            <a
              href={`${window.location.origin}${window.location.pathname}?page=dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 px-4 border border-[#ba1a1a] bg-[#FFFFFF] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.06em] uppercase hover:bg-[#0A0A0A] hover:text-[#FFFFFF] hover:border-[#0A0A0A] transition-colors items-center gap-2"
            >
              <ExternalLink size={14} />
              <span>Open Admin Dashboard in New Tab to Link Google</span>
            </a>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-[#E4E4E7] gap-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#71717A] hover:text-[#0A0A0A]'
          }`}
        >
          <Package size={15} />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lookbooks')}
          className={`px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'lookbooks'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#71717A] hover:text-[#0A0A0A]'
          }`}
        >
          <BookOpen size={15} />
          <span>Lookbooks ({lookbooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#71717A] hover:text-[#0A0A0A]'
          }`}
        >
          <Settings size={15} />
          <span>Store Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#71717A] hover:text-[#0A0A0A]'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Orders ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name, SKU, or color..."
                className="w-full h-11 pl-10 pr-4 border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <button
              onClick={openAddProduct}
              className="h-11 px-6 bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </button>
          </div>

          {/* Add / Edit Product Centered Modal */}
          {isProductFormOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div
                className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-[4px] transition-opacity"
                onClick={() => {
                  if (!savingProduct) setIsProductFormOpen(false);
                }}
              />
              <div
                className="relative min-h-screen flex items-center justify-center p-4 md:p-6"
                onClick={() => {
                  if (!savingProduct) setIsProductFormOpen(false);
                }}
              >
                <form
                  onSubmit={handleSubmitProduct}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-3xl bg-[#FFFFFF] border border-[#0A0A0A] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                >
                  {/* Sticky Modal Header */}
                  <div className="px-6 md:px-8 py-5 border-b border-[#E4E4E7] bg-[#FFFFFF] flex items-center justify-between shrink-0">
                    <div>
                      <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-[#71717A] mb-0.5">
                        ORRA BIT // PRODUCT EDITOR
                      </span>
                      <h2 className="font-serif text-2xl text-[#0A0A0A]">
                        {editingProductId ? 'Edit Product Details' : 'Add New Product'}
                      </h2>
                    </div>
                  </div>

                  {/* Scrollable Modal Body */}
                  <div className="p-6 md:p-8 overflow-y-auto space-y-5 bg-[#F9F9F9] flex-1">
                    {feedback && feedback.type === 'error' && (
                      <div className="p-3.5 border border-[#ba1a1a] bg-[#FFF5F5] text-[#ba1a1a] text-[12px] flex items-start gap-2">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{feedback.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Obsidian Heavyweight Hoodie"
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="OV-HD-017"
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as Exclude<Category, 'All'>
                      })
                    }
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Price (EGP) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Editorial Kicker (Optional)
                  </label>
                  <input
                    type="text"
                    value={productForm.editorialKicker}
                    onChange={(e) =>
                      setProductForm({ ...productForm, editorialKicker: e.target.value })
                    }
                    placeholder="e.g. SIGNATURE PIECE"
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Composition *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.composition}
                    onChange={(e) => setProductForm({ ...productForm, composition: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Origin *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.origin}
                    onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Fit *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.fit}
                    onChange={(e) => setProductForm({ ...productForm, fit: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Care Instructions *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.care}
                    onChange={(e) => setProductForm({ ...productForm, care: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Image URLs (One URL per line) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={productForm.imagesText}
                  onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                  placeholder="https://cdn.shopify.com/..."
                  className="w-full p-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[12px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              {/* Sizes & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFFFF] border border-[#E4E4E7] p-4">
                <div>
                  <span className="block text-[11px] font-mono uppercase text-[#71717A] mb-2">
                    Available Sizes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((sz) => {
                      const active = productForm.sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleProductSize(sz)}
                          className={`w-10 h-9 text-[12px] font-mono border transition-colors ${
                            active
                              ? 'bg-[#0A0A0A] text-[#FFFFFF] border-[#0A0A0A]'
                              : 'bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-mono uppercase text-[#71717A] mb-2">
                    In-Stock Sizes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((sz) => {
                      const enabled = productForm.sizes.includes(sz);
                      const inStock = productForm.inStockSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={!enabled}
                          onClick={() => handleToggleInStockSize(sz)}
                          className={`w-10 h-9 text-[12px] font-mono border transition-colors disabled:opacity-30 ${
                            inStock
                              ? 'bg-[#0A0A0A] text-[#FFFFFF] border-[#0A0A0A]'
                              : 'bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded-none accent-[#0A0A0A]"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="w-4 h-4 rounded-none accent-[#0A0A0A]"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

                  </div>

                  {/* Sticky Modal Footer */}
                  <div className="px-6 md:px-8 py-4 border-t border-[#E4E4E7] bg-[#FFFFFF] flex items-center justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      disabled={savingProduct}
                      onClick={() => setIsProductFormOpen(false)}
                      className="h-11 px-6 border border-[#E4E4E7] bg-[#FFFFFF] text-[#0A0A0A] text-[12px] font-semibold tracking-[0.08em] uppercase hover:border-[#0A0A0A] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="h-11 px-8 bg-[#0A0A0A] text-[#FFFFFF] text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-[#27272A] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingProduct ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <Check size={15} />
                          <span>{editingProductId ? 'Save Changes' : 'Add & Save Product'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products List */}
          {isLoadingDb ? (
            <div className="py-16 text-center border border-[#E4E4E7]">
              <Loader2 size={24} className="animate-spin mx-auto mb-3 text-[#0A0A0A]" />
              <p className="text-[12px] font-mono text-[#71717A] uppercase">Loading Products from Firestore...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center border border-[#E4E4E7] bg-[#F9F9F9]">
              <p className="font-serif text-2xl text-[#0A0A0A] mb-2">No Products Recorded Yet</p>
              <p className="text-[13px] text-[#71717A]">
                Click &ldquo;Add Product&rdquo; to create and save items in the database.
              </p>
            </div>
          ) : (
            <div className="border border-[#E4E4E7] divide-y divide-[#E4E4E7]">
              {filteredProducts.map((product) => {
                const isConfirming = confirmDeleteProductId === product.id;
                const isDeleting = deletingProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] hover:bg-[#F9F9F9] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#71717A]">
                            {product.sku} · {product.category}
                          </span>
                          {product.featured && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#0A0A0A] text-[#FFFFFF]">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <h3 className="text-[15px] font-medium text-[#0A0A0A]">{product.name}</h3>
                        <p className="text-[12px] font-mono text-[#71717A] mt-0.5">
                          {product.price.toLocaleString()} {product.currency || 'EGP'} · {product.color} · Sizes: {product.inStockSizes.join(', ') || 'Out of stock'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditProduct(product)}
                        disabled={isDeleting}
                        className="h-9 px-3.5 border border-[#E4E4E7] bg-[#FFFFFF] text-[#0A0A0A] text-[11px] font-mono uppercase hover:border-[#0A0A0A] transition-colors flex items-center gap-1.5"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            disabled={isDeleting}
                            className="h-9 px-3.5 bg-[#ba1a1a] text-[#FFFFFF] text-[11px] font-mono uppercase hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <span>Confirm Delete</span>
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteProductId(null)}
                            disabled={isDeleting}
                            className="h-9 px-3 border border-[#E4E4E7] text-[11px] font-mono uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteProductId(product.id)}
                          disabled={isDeleting}
                          className="h-9 px-3.5 border border-[#E4E4E7] bg-[#FFFFFF] text-[#ba1a1a] text-[11px] font-mono uppercase hover:border-[#ba1a1a] transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOOKBOOKS */}
      {activeTab === 'lookbooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[#71717A]">
              Manage Lookbook Monograph Spreads synced with the live database.
            </p>
            <button
              onClick={openAddLookbook}
              className="h-11 px-6 bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors flex items-center gap-2"
            >
              <Plus size={15} />
              <span>Add Spread</span>
            </button>
          </div>

          {isLookbookFormOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div
                className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-[4px] transition-opacity"
                onClick={() => {
                  if (!savingLookbook) setIsLookbookFormOpen(false);
                }}
              />
              <div
                className="relative min-h-screen flex items-center justify-center p-4 md:p-6"
                onClick={() => {
                  if (!savingLookbook) setIsLookbookFormOpen(false);
                }}
              >
                <form
                  onSubmit={handleSubmitLookbook}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-3xl bg-[#FFFFFF] border border-[#0A0A0A] shadow-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-5"
                >
                  <div className="pb-3 border-b border-[#E4E4E7]">
                    <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-[#71717A] mb-0.5">
                      ORRA BIT // LOOKBOOK EDITOR
                    </span>
                    <h2 className="font-serif text-2xl text-[#0A0A0A]">
                      {editingLookbookId ? 'Edit Lookbook Spread' : 'Add New Lookbook Spread'}
                    </h2>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Chapter *
                  </label>
                  <input
                    type="text"
                    required
                    value={lookbookForm.chapter}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, chapter: e.target.value })}
                    placeholder="01"
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Spread Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={lookbookForm.title}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, title: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Editorial Quote *
                </label>
                <input
                  type="text"
                  required
                  value={lookbookForm.quote}
                  onChange={(e) => setLookbookForm({ ...lookbookForm, quote: e.target.value })}
                  className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Narrative *
                </label>
                <textarea
                  rows={3}
                  required
                  value={lookbookForm.narrative}
                  onChange={(e) => setLookbookForm({ ...lookbookForm, narrative: e.target.value })}
                  className="w-full p-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Primary Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={lookbookForm.primaryImage}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, primaryImage: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[12px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                    Secondary Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={lookbookForm.secondaryImage}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, secondaryImage: e.target.value })}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[12px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E4E4E7] p-4">
                <span className="block text-[11px] font-mono uppercase text-[#71717A] mb-2">
                  Featured Products in This Spread (Max 10)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {products.map((p) => {
                    const checked = lookbookForm.featuredProductIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-[12px] cursor-pointer p-1.5 hover:bg-[#F9F9F9]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setLookbookForm((prev) => ({
                              ...prev,
                              featuredProductIds: checked
                                ? prev.featuredProductIds.filter((id) => id !== p.id)
                                : [...prev.featuredProductIds, p.id].slice(0, 10)
                            }));
                          }}
                          className="w-4 h-4 rounded-none accent-[#0A0A0A]"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingLookbook}
                  className="h-11 px-8 bg-[#0A0A0A] text-[#FFFFFF] text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-[#27272A] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {savingLookbook ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>{editingLookbookId ? 'Save Spread Changes' : 'Save Spread to Database'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={savingLookbook}
                  onClick={() => setIsLookbookFormOpen(false)}
                  className="h-11 px-6 border border-[#E4E4E7] bg-[#FFFFFF] text-[#0A0A0A] text-[12px] font-semibold uppercase"
                >
                  Cancel
                </button>
              </div>
                </form>
              </div>
            </div>
          )}

          <div className="border border-[#E4E4E7] divide-y divide-[#E4E4E7]">
            {lookbooks.length === 0 ? (
              <div className="p-12 text-center bg-[#F9F9F9]">
                <p className="font-serif text-2xl text-[#0A0A0A]">No Lookbook Spreads Recorded</p>
              </div>
            ) : (
              lookbooks.map((spread) => {
                const isConfirming = confirmDeleteLookbookId === spread.id;
                const isDeleting = deletingLookbookId === spread.id;
                return (
                  <div
                    key={spread.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF]"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={spread.primaryImage}
                        alt={spread.title}
                        className="w-16 h-20 object-cover border border-[#E4E4E7]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#71717A]">
                          CHAPTER {spread.chapter} · {spread.featuredProductIds.length} Featured Pieces
                        </span>
                        <h3 className="font-serif text-xl text-[#0A0A0A]">{spread.title}</h3>
                        <p className="text-[12px] text-[#71717A] line-clamp-1 max-w-xl">
                          {spread.quote}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditLookbook(spread)}
                        disabled={isDeleting}
                        className="h-9 px-3.5 border border-[#E4E4E7] text-[11px] font-mono uppercase hover:border-[#0A0A0A] flex items-center gap-1.5"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteLookbook(spread)}
                            disabled={isDeleting}
                            className="h-9 px-3.5 bg-[#ba1a1a] text-[#FFFFFF] text-[11px] font-mono uppercase flex items-center gap-1.5"
                          >
                            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : null}
                            <span>Confirm Delete</span>
                          </button>
                          <button
                            onClick={() => setConfirmDeleteLookbookId(null)}
                            className="h-9 px-3 border border-[#E4E4E7] text-[11px] font-mono uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteLookbookId(spread.id)}
                          disabled={isDeleting}
                          className="h-9 px-3.5 border border-[#E4E4E7] text-[#ba1a1a] text-[11px] font-mono uppercase hover:border-[#ba1a1a] flex items-center gap-1.5"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STOREFRONT & PAYMENT SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8 border border-[#E4E4E7] p-6 md:p-8 bg-[#FFFFFF]">
          <div className="pb-4 border-b border-[#E4E4E7]">
            <h2 className="font-serif text-2xl text-[#0A0A0A]">Storefront & Payment Settings</h2>
            <p className="text-[12px] text-[#71717A] mt-1">
              Changes saved here update the database and reflect immediately across the live storefront.
            </p>
          </div>

          {/* Payment & Shipping Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#0A0A0A] border-b border-[#E4E4E7] pb-2">
              1. Payment & Shipping Settings (InstaPay, Vodafone Cash & Courier)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  InstaPay Address (IPA)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.instapayIpa}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instapayIpa: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Vodafone Cash Number
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.vodafoneCashNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, vodafoneCashNumber: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Free Shipping Threshold (EGP)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={settingsForm.freeShippingThreshold}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      freeShippingThreshold: Number(e.target.value)
                    })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Courier Shipping Fee (EGP)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={settingsForm.shippingFee}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, shippingFee: Number(e.target.value) })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#0A0A0A] border-b border-[#E4E4E7] pb-2">
              2. Hero Section Copy & Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Hero Eyebrow
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroEyebrow}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroEyebrow: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Hero Season
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroSeason}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSeason: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Hero Main Title
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Hero Quote
                </label>
                <textarea
                  rows={2}
                  required
                  value={settingsForm.heroQuote}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroQuote: e.target.value })}
                  className="w-full p-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Hero Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={settingsForm.heroDescription}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroDescription: e.target.value })
                  }
                  className="w-full p-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Left Card Image URL
                </label>
                <input
                  type="url"
                  required
                  value={settingsForm.heroLeftImage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroLeftImage: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[12px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Left Card Label
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroLeftLabel}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroLeftLabel: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Left Card Price Label
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroLeftPrice}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroLeftPrice: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Right Spotlight Image URL
                </label>
                <input
                  type="url"
                  required
                  value={settingsForm.heroRightImage}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroRightImage: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[12px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Right Spotlight Title
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroRightTitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroRightTitle: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Right Spotlight Description
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroRightDescription}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroRightDescription: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Right Spotlight Badge
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroRightBadge}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroRightBadge: e.target.value })
                  }
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          {/* Essay Banner Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#0A0A0A] border-b border-[#E4E4E7] pb-2">
              3. Manufacturing Essay Banner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Banner Title
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.bannerTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bannerTitle: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  required
                  value={settingsForm.bannerImage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bannerImage: e.target.value })}
                  className="w-full h-11 px-3 border border-[#E4E4E7] text-[12px] font-mono focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Banner Quote
                </label>
                <textarea
                  rows={2}
                  required
                  value={settingsForm.bannerQuote}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bannerQuote: e.target.value })}
                  className="w-full p-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1">
                  Banner Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={settingsForm.bannerDescription}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, bannerDescription: e.target.value })
                  }
                  className="w-full p-3 border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="h-12 px-8 bg-[#0A0A0A] text-[#FFFFFF] text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-[#27272A] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save All Settings to Database</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {!isSupabaseAdminUser(supabaseUser) ? (
            <div className="py-16 text-center border border-[#E4E4E7] bg-[#F9F9F9]">
              <p className="font-serif text-2xl text-[#0A0A0A] mb-1">Supabase Admin Sign-In Required</p>
              <p className="text-[13px] text-[#71717A]">
                Sign in with your authorized Supabase admin account to view and manage customer orders.
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center border border-[#E4E4E7] bg-[#F9F9F9]">
              <p className="font-serif text-2xl text-[#0A0A0A] mb-1">No Orders Recorded Yet</p>
              <p className="text-[13px] text-[#71717A]">
                All confirmed customer orders saved to the database will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderId = order.id || order.orderNumber;
                const isUpdating = updatingOrderId === orderId;
                const isConfirming = confirmDeleteOrderId === orderId;
                const isDeleting = deletingOrderId === orderId;

                return (
                  <div key={orderId} className="border border-[#E4E4E7] bg-[#FFFFFF] p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E4E4E7]">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#71717A]">
                          ORDER #{order.orderNumber}
                        </span>
                        <h3 className="text-[15px] font-semibold text-[#0A0A0A]">
                          {order.firstName} {order.lastName} · {order.phone}
                        </h3>
                        <p className="text-[12px] text-[#71717A]">
                          {order.email} · {order.address}, {order.city}, {order.country}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                          {isUpdating && <Loader2 size={14} className="animate-spin text-[#0A0A0A]" />}
                          <select
                            value={order.status}
                            disabled={isUpdating || isDeleting}
                            onChange={(e) =>
                              handleStatusChange(orderId, e.target.value as OrderStatus)
                            }
                            className="h-9 px-3 border border-[#0A0A0A] bg-[#FFFFFF] text-[11px] font-mono uppercase focus:outline-none"
                          >
                            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((st) => (
                              <option key={st} value={st}>
                                {ORDER_STATUS_LABELS[st]}
                              </option>
                            ))}
                          </select>
                        </div>

                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteOrder(orderId, order.orderNumber)}
                              disabled={isDeleting}
                              className="h-9 px-3 bg-[#ba1a1a] text-[#FFFFFF] text-[11px] font-mono uppercase flex items-center gap-1"
                            >
                              {isDeleting && <Loader2 size={13} className="animate-spin" />}
                              <span>Confirm Delete</span>
                            </button>
                            <button
                              onClick={() => setConfirmDeleteOrderId(null)}
                              className="h-9 px-3 border border-[#E4E4E7] text-[11px] font-mono uppercase"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteOrderId(orderId)}
                            className="h-9 px-3 border border-[#E4E4E7] text-[#ba1a1a] text-[11px] font-mono uppercase hover:border-[#ba1a1a] flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-mono uppercase text-[#71717A] block">
                          Items ({order.items.length})
                        </span>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const itemImage =
                              item.image ||
                              products.find(
                                (p) => p.id === item.productId || p.sku === item.sku
                              )?.images[0] ||
                              '';
                            return (
                              <div
                                key={`${item.productId}-${idx}`}
                                className="flex items-center justify-between gap-3 border border-[#E4E4E7] bg-[#FAFAFA] p-2"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {itemImage ? (
                                    <img
                                      src={itemImage}
                                      alt={item.name}
                                      className="w-12 aspect-[3/4] object-cover object-center bg-[#F4F4F5] border border-[#E4E4E7] shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-12 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[#71717A] shrink-0">
                                      <Package size={16} />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <span className="block font-medium text-[#0A0A0A] truncate">
                                      {item.name}
                                    </span>
                                    <span className="block text-[11px] font-mono text-[#71717A]">
                                      {item.sku ? `${item.sku} · ` : ''}Size {item.size} × {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-mono font-medium text-[#0A0A0A] whitespace-nowrap shrink-0">
                                  {(item.price * item.quantity).toLocaleString()} EGP
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-[#F9F9F9] border border-[#E4E4E7] p-3 space-y-1 text-[12px]">
                        <div className="flex justify-between">
                          <span className="text-[#71717A]">Payment Method:</span>
                          <span className="font-mono uppercase">{order.paymentMethod}</span>
                        </div>
                        {order.paymentReference && (
                          <div className="flex justify-between">
                            <span className="text-[#71717A]">Reference:</span>
                            <span className="font-mono">{order.paymentReference}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-1 border-t border-[#E4E4E7]">
                          <span>Total:</span>
                          <span className="font-mono">{order.total.toLocaleString()} EGP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
