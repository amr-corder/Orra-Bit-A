import { Category, LookbookSpread, Product, StoreSettings } from '../types';

export type Language = 'en' | 'ar';

export const LANGUAGE_STORAGE_KEY = 'orra_bit_lang_v1';

const CATEGORY_AR: Record<Category, string> = {
  All: 'الكل',
  'Signature Editions': 'الإصدارات المميزة',
  'Graphic Series': 'سلسلة الجرافيك',
  'Minimalist Oversized': 'أوفرسايز مينيمال',
  'Earthy Tones': 'ألوان ترابية',
  'Deep Navy': 'كحلي وملكي'
};

export function translateCategory(category: Category, lang: Language): string {
  return lang === 'ar' ? CATEGORY_AR[category] || category : category;
}

export function translateCurrency(currency: string | undefined, lang: Language): string {
  const code = currency || 'EGP';
  if (lang === 'ar' && code.toUpperCase() === 'EGP') {
    return 'ج.م';
  }
  return code;
}

const COLOR_AR: Record<string, string> = {
  'Obsidian Black': 'أسود أوبسيديان',
  'Heather Light Grey': 'رمادي فاتح ميلانج',
  'Deep Burgundy': 'عنابي داكن',
  'Olive Green': 'زيتوني',
  'Midnight Navy': 'كحلي داكن',
  'Crisp White': 'أبيض ناصع',
  'Steel Slate Grey': 'رمادي فولاذي',
  'Royal Blue': 'أزرق ملكي',
  'Warm Earth Brown': 'بني ترابي دافئ',
  'Jet Black': 'أسود فاحم'
};

const PRODUCT_AR_MAP: Record<
  string,
  Partial<Pick<Product, 'name' | 'color' | 'description' | 'editorialKicker'>>
> = {
  'black-oversized-hoodie': {
    name: 'هودي أسود أوفرسايز',
    description:
      'هودي أوفرسايز عصري أنيق مصنوع من القطن المصري الفاخر 100% لإطلالة ستريت وير مريحة. يتميز بقصّة واسعة وأكتاف ساقطة وأكمام مريحة وهود متماسك مع أساور وحافة مضلّعة. اللون الأسود الكلاسيكي يمنحه طابعًا مينيمال خالدًا يناسب كل إطلالة يومية.'
  },
  'light-grey-oversized-hoodie': {
    name: 'هودي رمادي فاتح أوفرسايز',
    description:
      'قصّة أوفرسايز مريحة بأكتاف ساقطة وتصميم واسع، مصنوع من قطن 100% بملمس ناعم ومريح يسمح بالتهوية. مزود بهود واسع وجيب كانجارو وأساور وحافة مضلّعة، مثالي لإطلالات الستريت وير اليومية.'
  },
  'burgundy-oversized-hoodie': {
    name: 'هودي عنابي أوفرسايز',
    description:
      'هودي أوفرسايز عصري مصنوع من القطن الفاخر 100% لراحة ستريت وير متكاملة. يأتي بقصّة واسعة وأكتاف ساقطة وهود متماسك مع حواف مضلّعة. اللون العنابي الغني يضيف لمسة فخمة تتناغم بسهولة مع الجينز وملابس الستريت وير.'
  },
  'rise-again-black-hoodie': {
    name: 'هودي رايز أجين — أسود',
    editorialKicker: 'عرض الستريت وير',
    description:
      'هودي أوفرسايز بارز مستوحى من نقوش السجاد الفارسي الكلاسيكي بمزيج يجمع بين الزخارف التراثية وروح الستريت وير الحديثة. يحمل عبارة "Resilient Against Conformity" و"Rise Again" كتذكير بالثبات والنهوض أقوى في كل مرة. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'rise-again-navy-hoodie': {
    name: 'هودي رايز أجين — زيتوني',
    editorialKicker: 'عرض الستريت وير',
    description:
      'هودي أوفرسايز بارز مستوحى من نقوش السجاد الفارسي الكلاسيكي بمزيج يجمع بين الزخارف التراثية وروح الستريت وير الحديثة. يحمل عبارة "Resilient Against Conformity" و"Rise Again" كتذكير بالثبات والنهوض أقوى في كل مرة. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'olive-oversized-hoodie': {
    name: 'هودي زيتوني أوفرسايز',
    editorialKicker: 'عرض الستريت وير',
    description:
      'هودي أوفرسايز عصري مصنوع من القطن الفاخر 100% بإحساس ستريت وير مريح. يتميز بقصّة واسعة وأكتاف ساقطة وهود متماسك وحواف مضلّعة. اللون الزيتوني يمنحه مظهرًا ترابيًا أنيقًا يسهل تنسيقه يوميًا.'
  },
  'navy-oversized-hoodie': {
    name: 'هودي كحلي أوفرسايز',
    description:
      'هودي أوفرسايز عصري مصنوع من القطن الفاخر 100% بإحساس ستريت وير مريح. يتميز بقصّة واسعة وأكتاف ساقطة وهود متماسك وحواف مضلّعة. اللون الكحلي يمنحه طابعًا كلاسيكيًا أنيقًا يناسب جميع الإطلالات اليومية.'
  },
  'ace-of-spades-white-hoodie': {
    name: 'هودي آس أوف سبيدز — أبيض',
    description:
      'هودي أوفرسايز جريء يتميز برسمة "Ace of Spades" متقنة بتصميم فينتاج فريد، مع نصوص "Joker and the Thief" وتفاصيل أوراق اللعب لإطلالة ستريت وير داكنة ومميزة. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'ace-of-spades-navy-hoodie': {
    name: 'هودي آس أوف سبيدز — كحلي',
    description:
      'هودي أوفرسايز جريء يتميز برسمة "Ace of Spades" متقنة بتصميم فينتاج فريد، مع نصوص "Joker and the Thief" وتفاصيل أوراق اللعب لإطلالة ستريت وير داكنة ومميزة. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'counter-culture-black-hoodie': {
    name: 'هودي كاونتر كالتشر — أسود',
    description:
      'هودي أوفرسايز جريء صُمم لمن يرى العالم بطريقة مختلفة. يحمل تصميم "Counter Culture" على الظهر بخطوط متآكلة جريئة وعبارة "The Misfits. The Rebels." في الأمام لإطلالة متمردة وعصرية. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'steel-oversized-hoodie': {
    name: 'هودي رمادي فولاذي أوفرسايز',
    description:
      'هودي أوفرسايز عصري مصنوع من القطن الفاخر 100% بتصميم واسع وأكتاف ساقطة وهود متماسك مع أساور مضلّعة. اللون الرمادي الفولاذي يمنحه طابعًا مينيمال أنيقًا وسهل التنسيق مع إطلالات الستريت وير.'
  },
  'joker-navy-hoodie': {
    name: 'هودي جوكر — كحلي',
    description:
      'هودي أوفرسايز فاخر مستوحى من فن الطوابع البريدية الكلاسيكية والمقتنيات النادرة. يحمل عبارة "Rare Collection" في الأمام مع تصميم خلفي فني لطوابع البورتريه وتفاصيل "Stamp Art" لإطلالة فينتاج فريدة. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'counter-culture-burgandy-hoodie': {
    name: 'هودي كاونتر كالتشر — عنابي',
    description:
      'هودي أوفرسايز جريء صُمم لمن يرى العالم بطريقة مختلفة. يحمل تصميم "Counter Culture" على الظهر بخطوط متآكلة جريئة وعبارة "The Misfits. The Rebels." في الأمام لإطلالة متمردة وعصرية. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'royal-blue-oversized-hoodie': {
    name: 'هودي أزرق ملكي أوفرسايز',
    description:
      'هودي أوفرسايز عصري مصنوع من القطن الفاخر 100% بقصّة واسعة وأكتاف ساقطة وهود متماسك وحواف مضلّعة. اللون الأزرق الملكي الغني يضفي حضورًا جريئًا ومينيمال في آن واحد لإطلالاتك اليومية.'
  },
  'panda-climb-white-hoodie': {
    name: 'هودي باندا كلايمب — أبيض',
    description:
      'هودي أوفرسايز مرح يتميز برسمة باندا دقيقة مستوحاة من التسلق والمغامرة. العمل الفني بالأبيض والأسود يضيف طابعًا مميزًا مع الحفاظ على بساطة التصميم وسهولة تنسيقه. قطن 100% • قصّة أوفرسايز • طباعة فاخرة.'
  },
  'brown-oversized-hoodie': {
    name: 'هودي بني أوفرسايز',
    description:
      'هودي أوفرسايز عصري مصنوع من القطن الفاخر 100% بقصّة واسعة وأكتاف ساقطة وهود متماسك وحواف مضلّعة. اللون البني الغني يمنحه دفئًا وأناقة خالدة تتناغم مع ملابس الستريت وير اليومية.'
  }
};

export function translateProduct(product: Product, lang: Language): Product {
  if (lang === 'en') return product;

  const entry = PRODUCT_AR_MAP[product.id];
  const translatedColor = COLOR_AR[product.color] || product.color;

  const translatedKicker =
    entry?.editorialKicker ||
    (product.editorialKicker === 'OVAEN SIGNATURE PIECE'
      ? 'قطعة أوفاين المميزة'
      : product.editorialKicker === 'STREETWEAR RUNWAY'
      ? 'عرض الستريت وير'
      : product.editorialKicker);

  const translatedComposition =
    product.composition.includes('Egyptian Heavyweight Cotton')
      ? 'قطن مصري ثقيل 100% · بطانة داخلية ناعمة مبرّدة'
      : product.composition;

  const translatedOrigin =
    product.origin === 'Authentic OVAEN Atelier'
      ? 'أتيليه أوفاين الأصلي'
      : product.origin;

  const translatedFit =
    product.fit.includes('Oversized modern streetwear silhouette')
      ? 'قصّة ستريت وير أوفرسايز عصرية بأكتاف ساقطة وهود واسع.'
      : product.fit;

  const translatedCare =
    product.care.includes('Machine wash cold')
      ? 'يُغسل بالغسالة بالماء البارد مقلوبًا مع ألوان مشابهة. يُمنع الكيّ مباشرة فوق الطباعة.'
      : product.care;

  return {
    ...product,
    name: entry?.name || product.name,
    color: translatedColor,
    description: entry?.description || product.description,
    composition: translatedComposition,
    origin: translatedOrigin,
    fit: translatedFit,
    care: translatedCare,
    editorialKicker: translatedKicker
  };
}

const LOOKBOOK_AR_MAP: Record<
  string,
  Pick<LookbookSpread, 'title' | 'quote' | 'narrative'>
> = {
  'spread-1': {
    title: 'أرشيف رايز أجين',
    quote:
      'الفخامة الملموسة لا تُصنع بالضجيج، بل بثقل القطن الفاخر وانسيابية القصّة الأوفرسايز والسرد البصري الدقيق.',
    narrative:
      'تستكشف مجموعة رايز أجين ثقافة الشارع المعاصرة. يجمع القطن المصري الثقيل 100% مع الطباعة المتقنة وحجم الهود المزدوج ليمنحك حضورًا أصيلاً.'
  },
  'spread-2': {
    title: 'كاونتر كالتشر وتوتر الجرافيك',
    quote: 'كل غرزة توازن بين راحة الشارع العفوية وصلابة النسيج عالي الكثافة.',
    narrative:
      'صُممت هوديز أوفاين لسهولة التنسيق اليومي، مع التركيز على اتساع الصدر والأكتاف الساقطة والحفاظ على متانة الأساور والحواف.'
  },
  'spread-3': {
    title: 'مونوكروم آس أوف سبيدز',
    quote: 'البساطة المعمارية تلتقي بالرمزية الجريئة على فليس ثقيل نقي.',
    narrative:
      'استعراض لنسختي الأبيض الناصع والكحلي الداكن من تصميم Ace of Spades. مصنوع من قطن 100% عالي الكثافة مع هود هيكلي يحافظ على شكله طوال اليوم.'
  }
};

export function translateLookbook(spread: LookbookSpread, lang: Language): LookbookSpread {
  if (lang === 'en') return spread;
  const entry = LOOKBOOK_AR_MAP[spread.id];
  if (!entry) return spread;
  return {
    ...spread,
    title: entry.title,
    quote: entry.quote,
    narrative: entry.narrative
  };
}

export function translateStoreSettings(settings: StoreSettings, lang: Language): StoreSettings {
  const normalizedHeroSeason =
    settings.heroSeason === 'STREETWEAR COLLECTION 2026'
      ? 'STREETWEAR COLLECTION'
      : settings.heroSeason;

  if (lang === 'en') {
    return {
      ...settings,
      heroSeason: normalizedHeroSeason
    };
  }

  return {
    ...settings,
    heroEyebrow:
      settings.heroEyebrow === 'OVAEN / HOODIES ARCHIVE'
        ? 'أوفاين / أرشيف الهوديز'
        : settings.heroEyebrow,
    heroSeason:
      normalizedHeroSeason === 'STREETWEAR COLLECTION'
        ? 'مجموعة ستريت وير'
        : normalizedHeroSeason,
    heroTitle:
      settings.heroTitle === 'COLLECTION 04' ? 'المجموعة 04' : settings.heroTitle,
    heroQuote:
      settings.heroQuote ===
      '100% premium heavyweight cotton, dropped-shoulder ease, and authentic street graphics.'
        ? 'قطن فاخر ثقيل 100%، راحة الأكتاف الساقطة، ورسومات ستريت وير أصيلة.'
        : settings.heroQuote,
    heroDescription:
      settings.heroDescription.startsWith('Discover the complete Ovaen Hoodies Collection')
        ? 'اكتشف مجموعة هوديز أوفاين الكاملة. تضم قطعًا أيقونية مثل Rise Again وCounter Culture وAce of Spades بالإضافة إلى تصاميم الأوفرسايز المينيمال.'
        : settings.heroDescription,
    heroLeftLabel:
      settings.heroLeftLabel === 'Counter Culture Black Hoodie'
        ? 'هودي كاونتر كالتشر الأسود'
        : settings.heroLeftLabel,
    heroLeftPrice: settings.heroLeftPrice.replace('EGP', 'ج.م'),
    heroRightTitle:
      settings.heroRightTitle === 'RISE AGAIN HOODIE'
        ? 'هودي رايز أجين'
        : settings.heroRightTitle,
    heroRightDescription:
      settings.heroRightDescription.startsWith('100% premium cotton with roomy oversized')
        ? 'قطن فاخر 100% بقصّة ستريت وير أوفرسايز واسعة، وهود متماسك مع طباعة شاشة متقنة.'
        : settings.heroRightDescription,
    heroRightBadge:
      settings.heroRightBadge === '100% HEAVY COTTON // 840 EGP'
        ? 'قطن ثقيل 100% // 840 ج.م'
        : settings.heroRightBadge.replace('EGP', 'ج.م'),
    bannerTitle:
      settings.bannerTitle === 'THE HOODIE AS ARCHITECTURE'
        ? 'الهودي كعمارة فنية'
        : settings.bannerTitle,
    bannerQuote:
      settings.bannerQuote.startsWith('We build for bodies that demand weight')
        ? 'نصمم لمن يطلب الثقل، التناسب، والحضور الصامت في عصر الضجيج الرقمي.'
        : settings.bannerQuote,
    bannerDescription:
      settings.bannerDescription.startsWith('Every hoodie in Collection 04 is constructed')
        ? 'كل هودي في المجموعة 04 مصنوع من قطن فرينش تيري مخصص بكثافة 550 GSM. تصميم الهود مزدوج الطبقات يستغني عن الأربطة مع الحفاظ على استقامة ووقفة معمارية أنيقة.'
        : settings.bannerDescription
  };
}

export interface StorefrontCopy {
  nav: {
    collection: string;
    signatures: string;
    graphicSeries: string;
    minimalist: string;
    earthy: string;
    navy: string;
    lookbook: string;
    monograph: string;
    search: string;
    bag: string;
    switchLangLabel: string;
    switchLangShort: string;
    toggleMenu: string;
    viewWishlist: string;
    viewBag: string;
    searchCollection: string;
    collectionFull: string;
    signaturesFull: string;
    graphicFull: string;
    minimalistFull: string;
    earthyFull: string;
    navyFull: string;
    editorialLookbook: string;
    theMonograph: string;
    footerTagLeft: string;
    footerTagRight: string;
  };
  hero: {
    exploreBtn: string;
    lookbookBtn: string;
    featuredSilhouette: string;
    shopSeries: string;
    craft1: string;
    craft2: string;
    craft3: string;
  };
  filter: {
    filterPrefix: string;
    clear: string;
    showing: string;
    of: string;
    works: string;
    sortLabel: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
    view4: string;
    view3: string;
    viewLookbook: string;
  };
  catalog: {
    archivePrefix: string;
    permanentCollection: string;
    architectureSuffix: string;
    framingLabel: string;
    pieces: string;
    noPiecesTitle: string;
    noMatchingTitle: string;
    noPiecesBody: string;
    noMatchingBody: string;
    resetFilters: string;
    addInAdmin: string;
    manufacturingEssay: string;
    readMonograph: string;
    loadingDb: string;
    dbReadyEyebrow: string;
    dbReadyTitle: string;
    dbReadyBody: string;
    openDashboard: string;
    dismiss: string;
    addedToBagToast: string;
    removedWishlistToast: string;
    savedWishlistToast: string;
    signedOutToast: string;
  };
  card: {
    newEdition: string;
    instantSelect: string;
    added: string;
    sizeLabel: string;
    addWishlist: string;
    removeWishlist: string;
  };
  pdp: {
    color: string;
    selectSize: string;
    sizingMonograph: string;
    cutMatrixTitle: string;
    chestS: string;
    chestM: string;
    chestL: string;
    chestXL: string;
    sizingNote: string;
    addToBag: string;
    addedToBag: string;
    saveArchive: string;
    savedArchive: string;
    materialsTitle: string;
    compositionLabel: string;
    originLabel: string;
    fitTitle: string;
    careTitle: string;
    shippingTitle: string;
    shippingBody1: string;
    shippingBody2: string;
    dispatchNote: string;
  };
  cart: {
    title: string;
    items: string;
    freeUnlocked: string;
    addPrefix: string;
    addSuffix: string;
    voidTitle: string;
    voidBody: string;
    exploreHoodies: string;
    sizeLabel: string;
    subtotal: string;
    delivery: string;
    complimentary: string;
    taxes: string;
    included: string;
    total: string;
    proceedCheckout: string;
    authenticNote: string;
  };
  wishlist: {
    title: string;
    pieces: string;
    emptyTitle: string;
    emptyBody: string;
    exploreCollection: string;
    addLabel: string;
    reservedNote: string;
    continueBrowsing: string;
  };
  search: {
    title: string;
    placeholder: string;
    filterAll: string;
    curatedQueries: string;
    matchingWorks: string;
    pressEnter: string;
    noFoundTitle: string;
    noFoundHint: string;
    trending: string[];
  };
  lookbook: {
    eyebrow1: string;
    eyebrow2: string;
    title: string;
    subtitle: string;
    chapter: string;
    figure: string;
    detail: string;
    worksFeatured: string;
    pieces: string;
  };
  monograph: {
    subtitle: string;
    s1Eyebrow: string;
    s1Title: string;
    s1Quote: string;
    s1Body: string;
    s2Eyebrow: string;
    atelier1City: string;
    atelier1Sub: string;
    atelier1Body: string;
    atelier2City: string;
    atelier2Sub: string;
    atelier2Body: string;
    atelier3City: string;
    atelier3Sub: string;
    atelier3Body: string;
    archiveFooter: string;
    exploreBtn: string;
  };
  checkout: {
    stepDetails: string;
    stepPayment: string;
    stepConfirmed: string;
    dispatchConfirm: string;
    orderHeading: string;
    receiptSentPrefix: string;
    receiptSentMid: string;
    shipmentDest: string;
    estimatedDelivery: string;
    deliveryDays: string;
    paymentMethodLabel: string;
    dueOnDelivery: string;
    totalSettled: string;
    printReceipt: string;
    returnArchive: string;
    section1Title: string;
    allRequired: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    deliveryMethodLabel: string;
    expressCourier: string;
    expressDesc: string;
    free: string;
    continuePayment: string;
    editDestination: string;
    secureCheckout: string;
    deliveringTo: string;
    selectPaymentTitle: string;
    instapayTitle: string;
    instapayDesc: string;
    instantBadge: string;
    instapayIpaLabel: string;
    copyIpa: string;
    copied: string;
    yourIpaLabel: string;
    yourIpaPlaceholder: string;
    vodafoneTitle: string;
    vodafoneDesc: string;
    walletBadge: string;
    walletNumberLabel: string;
    copyNumber: string;
    senderVodafoneLabel: string;
    codTitle: string;
    codDesc: string;
    codBadge: string;
    totalDueDelivery: string;
    courierCallPrefix: string;
    courierCallSuffix: string;
    deliveryNotesLabel: string;
    deliveryNotesPlaceholder: string;
    savePrefs: string;
    googlePrompt: string;
    signingIn: string;
    signInGoogle: string;
    openNewTab: string;
    savingOrder: string;
    confirmCod: string;
    confirmOrder: string;
    curatedItems: string;
    qty: string;
    size: string;
    subtotal: string;
    insuredCourier: string;
    complimentary: string;
    packagingTaxes: string;
    included: string;
    total: string;
    certificateNote: string;
    signInRequiredError: string;
    orderSaveFailedError: string;
    orderSaveFailedPrefix: string;
  };
  footer: {
    brandDesc: string;
    permanentLabel: string;
    seriesHeading: string;
    monographHeading: string;
    lookbookSpreads: string;
    brandManifesto: string;
    service1: string;
    service2: string;
    service3: string;
    newsletterTitle: string;
    newsletterBody: string;
    emailPlaceholder: string;
    enroll: string;
    enrolled: string;
    receiptConfirmed: string;
    rights: string;
    cities: string[];
    matrixBadge: string;
  };
}

export const STORE_STRINGS: Record<Language, StorefrontCopy> = {
  en: {
    nav: {
      collection: 'Collection 04',
      signatures: 'Signatures',
      graphicSeries: 'Graphic Series',
      minimalist: 'Minimalist Oversized',
      earthy: 'Earthy Tones',
      navy: 'Deep Navy',
      lookbook: 'Lookbook',
      monograph: 'Monograph',
      search: 'Search',
      bag: 'Bag',
      switchLangLabel: 'Translate site to Arabic',
      switchLangShort: 'عربي',
      toggleMenu: 'Toggle navigation menu',
      viewWishlist: 'View saved pieces',
      viewBag: 'View shopping bag',
      searchCollection: 'Search collection',
      collectionFull: 'Collection 04 / Hoodies',
      signaturesFull: 'Signature Editions (Rise Again & Ace)',
      graphicFull: 'Graphic Series (Counter Culture, Joker)',
      minimalistFull: 'Minimalist Oversized (Black, Grey, Steel)',
      earthyFull: 'Earthy Tones (Olive, Burgundy, Brown)',
      navyFull: 'Deep Navy & Royal Blue',
      editorialLookbook: 'Editorial Lookbook',
      theMonograph: 'The Monograph / Philosophy',
      footerTagLeft: 'ORRA BIT HOODIES',
      footerTagRight: 'PORTO · MILAN · KYOTO'
    },
    hero: {
      exploreBtn: 'Explore All',
      lookbookBtn: 'View Lookbook Spreads',
      featuredSilhouette: 'FEATURED SILHOUETTE',
      shopSeries: 'Shop Series →',
      craft1: 'Fast Courier Delivery Across Egypt & Worldwide',
      craft2: '100% Premium Egyptian Heavyweight Cotton',
      craft3: 'Oversized Streetwear Architecture · Collection 04'
    },
    filter: {
      filterPrefix: 'FILTER:',
      clear: 'Clear',
      showing: 'Showing',
      of: 'of',
      works: 'Works',
      sortLabel: 'Sort:',
      sortFeatured: 'Featured Curations',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortName: 'Alphabetical',
      view4: '4-Column Grid View',
      view3: '3-Column Focus View',
      viewLookbook: 'Lookbook Monograph View'
    },
    catalog: {
      archivePrefix: 'CURATED ARCHIVE',
      permanentCollection: 'The Permanent Collection',
      architectureSuffix: 'Architecture',
      framingLabel: '3:4 Monolithic Framing',
      pieces: 'Pieces',
      noPiecesTitle: 'No Pieces in Archive',
      noMatchingTitle: 'No Matching Works',
      noPiecesBody: 'No products are currently available in the database.',
      noMatchingBody:
        'No pieces match your current filter parameters. Clear your search or explore our core works.',
      resetFilters: 'Reset Archive Filters',
      addInAdmin: 'Add Products in Admin Dashboard',
      manufacturingEssay: 'MANUFACTURING ESSAY // 04',
      readMonograph: 'Read The Full Monograph',
      loadingDb: 'Loading Live Collection From Cloud Firestore...',
      dbReadyEyebrow: 'ORRA BIT // CLOUD FIRESTORE',
      dbReadyTitle: 'Database Ready for Initial Setup',
      dbReadyBody:
        'The store is connected to Cloud Firestore. Open the Admin Dashboard and sign in with an authorized admin account to seed the initial catalog or add your first products.',
      openDashboard: 'Open Admin Dashboard',
      dismiss: 'Dismiss',
      addedToBagToast: 'Added to bag',
      removedWishlistToast: 'Removed from archive',
      savedWishlistToast: 'Preserved in archive',
      signedOutToast: 'Signed out successfully'
    },
    card: {
      newEdition: 'NEW EDITION',
      instantSelect: 'Instant Select Size',
      added: 'Added',
      sizeLabel: 'SIZE:',
      addWishlist: 'Add to wishlist',
      removeWishlist: 'Remove from wishlist'
    },
    pdp: {
      color: 'Color:',
      selectSize: 'Select Size',
      sizingMonograph: 'Sizing Monograph',
      cutMatrixTitle: 'Monolith Cut Matrix (Inches)',
      chestS: 'S: 38 chest',
      chestM: 'M: 40 chest',
      chestL: 'L: 42 chest',
      chestXL: 'XL: 44 chest',
      sizingNote:
        'Tailored with intentional architectural drape. Choose normal size for modeled silhouette.',
      addToBag: 'Add to Bag',
      addedToBag: 'Added to Bag',
      saveArchive: 'Save to Archive',
      savedArchive: 'Saved in Archive',
      materialsTitle: 'Material & Provenance',
      compositionLabel: 'Composition:',
      originLabel: 'Origin:',
      fitTitle: 'Architectural Silhouette & Fit',
      careTitle: 'Care & Preservation',
      shippingTitle: 'Complimentary White-Glove Dispatch',
      shippingBody1: 'Shipped in archival reinforced garment box with custom dust cover.',
      shippingBody2: 'Complimentary 14-day insured courier return collection globally.',
      dispatchNote: 'Next-day dispatch from Biella & Paris ateliers'
    },
    cart: {
      title: 'Shopping Bag',
      items: 'ITEMS',
      freeUnlocked: 'COMPLIMENTARY COURIER SHIPPING UNLOCKED',
      addPrefix: 'ADD',
      addSuffix: 'EGP FOR FREE COURIER',
      voidTitle: 'Void',
      voidBody:
        'Your shopping bag is currently vacant. Explore the Ovaen Hoodies Collection to begin curating.',
      exploreHoodies: 'Explore Hoodies',
      sizeLabel: 'SIZE:',
      subtotal: 'Subtotal',
      delivery: 'Courier Delivery',
      complimentary: 'COMPLIMENTARY',
      taxes: 'Packaging & Taxes',
      included: 'INCLUDED',
      total: 'Total',
      proceedCheckout: 'Proceed to Checkout',
      authenticNote: 'Authentic Ovaen Direct Delivery'
    },
    wishlist: {
      title: 'Saved Works',
      pieces: 'PIECES',
      emptyTitle: 'Quiet',
      emptyBody:
        'You have not saved any pieces yet. Click the circular heart glyph on any item to preserve it in your archive.',
      exploreCollection: 'Explore Collection',
      addLabel: 'Add:',
      reservedNote: 'Items remain reserved in your browser archive',
      continueBrowsing: 'Continue Browsing'
    },
    search: {
      title: 'Archive Search',
      placeholder: 'Search by piece name, fabric, silhouette, or SKU...',
      filterAll: 'Filter All',
      curatedQueries: 'Curated Search Queries:',
      matchingWorks: 'Matching Works',
      pressEnter: 'Press Enter to filter catalog',
      noFoundTitle: 'No Matching Works Found',
      noFoundHint: 'Try searching for "Rise Again", "Counter Culture", "Oversized", or "Navy"',
      trending: ['Rise Again', 'Counter Culture', 'Ace of Spades', 'Black Oversized', 'Burgundy']
    },
    lookbook: {
      eyebrow1: 'ARCHITECTURAL SPREADS',
      eyebrow2: 'LOOKBOOK MONOGRAPH',
      title: 'THE MONOLITH STUDY',
      subtitle:
        'Visual dialogues capturing the geometry of silhouette against brutalist planar surfaces. Click any highlighted piece to inspect craftsmanship specifications.',
      chapter: 'CHAPTER',
      figure: 'FIGURE',
      detail: 'DETAIL',
      worksFeatured: 'WORKS FEATURED IN SPREAD',
      pieces: 'PIECES'
    },
    monograph: {
      subtitle: 'The Architectural Manifesto',
      s1Eyebrow: '01. ARCHITECTURAL MINIMALISM',
      s1Title: 'The Mastery of Void & Form',
      s1Quote:
        '“Tactility is achieved not through artificial drop shadows or physical skeuomorphism, but through hair-thin structural boundaries, precise type scales, subtle transition friction, and generous negative space reminiscent of an elite art monograph.”',
      s1Body:
        "ORRA BIT was conceived as a deliberate antidote to disposable apparel and excessive digital ornamentation. We reject rounded corners, decorative gradients, and trend cycles in favor of permanent architectural forms. Every piece is sculpted with sharp 90-degree discipline, allowing pure materiality to command the observer's gaze.",
      s2Eyebrow: '02. REGIONAL ATELIER PROVENANCE',
      atelier1City: 'BIELLA, ITALY',
      atelier1Sub: 'VIRGIN WOOL WEAVING',
      atelier1Body:
        '480 GSM double-face wools loomed using alpine glacial water for unmatched tactile density and natural resistance.',
      atelier2City: 'KYOTO, JAPAN',
      atelier2Sub: 'SEAMLESS CIRCULAR KNITTING',
      atelier2Body:
        'Fine-gauge Shima Seiki 3D whole-garment construction that eliminates shoulder seam friction and guarantees permanent structure.',
      atelier3City: 'FLORENCE, ITALY',
      atelier3Sub: 'TUSCAN CALFSKIN LEATHER',
      atelier3Body:
        '2.2mm vegetable-tanned French calf hides aged in chestnut bark extracts for structural rigidity and patina depth.',
      archiveFooter: 'ORRA BIT ARCHIVE · AUTUMN / WINTER 2026',
      exploreBtn: 'Explore Works in Collection 04'
    },
    checkout: {
      stepDetails: 'Step 1: Dispatch Destination',
      stepPayment: 'Step 2: Payment Method',
      stepConfirmed: 'Order Confirmed',
      dispatchConfirm: 'DISPATCH CONFIRMATION',
      orderHeading: 'Order',
      receiptSentPrefix: 'An authentication receipt has been sent to',
      receiptSentMid: 'Our courier team will coordinate delivery on',
      shipmentDest: 'Shipment Destination:',
      estimatedDelivery: 'Estimated Delivery:',
      deliveryDays: '2–4 Business Days',
      paymentMethodLabel: 'PAYMENT METHOD:',
      dueOnDelivery: 'Amount Due on Delivery:',
      totalSettled: 'Total Settled:',
      printReceipt: 'Print Receipt',
      returnArchive: 'Return to Archive',
      section1Title: '1. Client & Destination',
      allRequired: 'ALL FIELDS REQUIRED',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      mobile: 'Mobile Number',
      streetAddress: 'Street Address',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      deliveryMethodLabel: 'Delivery Method',
      expressCourier: 'Express Insured Courier',
      expressDesc: '2–4 Business Days · Egypt & Worldwide',
      free: 'FREE',
      continuePayment: 'Continue to Payment',
      editDestination: 'Edit Destination',
      secureCheckout: 'SECURE CHECKOUT',
      deliveringTo: 'Delivering to:',
      selectPaymentTitle: 'Select Payment Method',
      instapayTitle: 'InstaPay',
      instapayDesc: 'Instant bank transfer via IPA or mobile number',
      instantBadge: 'INSTANT',
      instapayIpaLabel: 'ORRA BIT InstaPay IPA',
      copyIpa: 'Copy IPA',
      copied: 'Copied',
      yourIpaLabel: 'Your InstaPay Address (IPA) or Transfer Reference',
      yourIpaPlaceholder: 'e.g. name@instapay or Ref #482910',
      vodafoneTitle: 'Vodafone Cash',
      vodafoneDesc: 'Transfer directly from your mobile wallet',
      walletBadge: 'WALLET',
      walletNumberLabel: 'ORRA BIT Wallet Number',
      copyNumber: 'Copy Number',
      senderVodafoneLabel: 'Sender Vodafone Cash Number',
      codTitle: 'Cash on Delivery',
      codDesc: 'Pay in cash upon courier arrival and inspection',
      codBadge: 'COD',
      totalDueDelivery: 'TOTAL DUE ON DELIVERY:',
      courierCallPrefix: 'Courier will call',
      courierCallSuffix: 'prior to arrival.',
      deliveryNotesLabel: 'Delivery Notes (Optional)',
      deliveryNotesPlaceholder: 'Building floor, apartment, or preferred time',
      savePrefs: 'Save shipping preferences for future orders',
      googlePrompt:
        'To permanently and securely save your order in the database, please verify your identity with Google:',
      signingIn: 'Signing in...',
      signInGoogle: 'Sign in with Google to confirm order',
      openNewTab: 'Open site in a new tab to sign in',
      savingOrder: 'Saving order to database...',
      confirmCod: 'Confirm COD Order',
      confirmOrder: 'Confirm Order',
      curatedItems: 'Curated Order Items',
      qty: 'Qty',
      size: 'Size',
      subtotal: 'Subtotal',
      insuredCourier: 'Insured Courier',
      complimentary: 'COMPLIMENTARY',
      packagingTaxes: 'Packaging & Taxes',
      included: 'INCLUDED',
      total: 'Total',
      certificateNote: 'Includes archival travel box and numbered certificate',
      signInRequiredError:
        'Please sign in with Google first to save your order permanently to the database.',
      orderSaveFailedError: 'Failed to save order to database. Please try again.',
      orderSaveFailedPrefix: 'Failed to save order:'
    },
    footer: {
      brandDesc:
        'An architectural fashion monograph exploring tension between void and structural mass. Specializing in 550 GSM loopback cotton, pure Mongolian cashmere, and rigid double-layered hood geometry.',
      permanentLabel: 'Permanent Archive // Collection 04 Hoodies',
      seriesHeading: 'Hoodie Series',
      monographHeading: 'Monograph',
      lookbookSpreads: 'Lookbook Spreads',
      brandManifesto: 'Brand Manifesto',
      service1: 'Loopback Preservation',
      service2: 'Custom Tailoring Sizing',
      service3: 'Global White-Glove Dispatch',
      newsletterTitle: 'The Digital Monograph',
      newsletterBody:
        'Receive private invitations to seasonal hoodie collection drops, numbered archive prints, and private atelier showings.',
      emailPlaceholder: 'Enter email address',
      enroll: 'Enroll',
      enrolled: 'Enrolled',
      receiptConfirmed: '✓ Receipt confirmed. Welcome to the ORRA BIT circle.',
      rights: 'ORRA BIT ATELIER. ALL RIGHTS RESERVED.',
      cities: ['PORTO', 'MILAN', 'KYOTO', 'PARIS'],
      matrixBadge: '550 GSM ARCHITECTURAL HOODIE MATRIX'
    }
  },
  ar: {
    nav: {
      collection: 'المجموعة 04',
      signatures: 'الإصدارات المميزة',
      graphicSeries: 'سلسلة الجرافيك',
      minimalist: 'أوفرسايز مينيمال',
      earthy: 'ألوان ترابية',
      navy: 'كحلي وملكي',
      lookbook: 'اللوك بوك',
      monograph: 'المانيفستو',
      search: 'بحث',
      bag: 'الحقيبة',
      switchLangLabel: 'Switch site to English',
      switchLangShort: 'EN',
      toggleMenu: 'فتح قائمة التنقل',
      viewWishlist: 'عرض القطع المحفوظة',
      viewBag: 'عرض حقيبة التسوق',
      searchCollection: 'البحث في المجموعة',
      collectionFull: 'المجموعة 04 / الهوديز',
      signaturesFull: 'الإصدارات المميزة (Rise Again و Ace)',
      graphicFull: 'سلسلة الجرافيك (Counter Culture و Joker)',
      minimalistFull: 'أوفرسايز مينيمال (أسود، رمادي، فولاذي)',
      earthyFull: 'ألوان ترابية (زيتوني، عنابي، بني)',
      navyFull: 'كحلي داكن وأزرق ملكي',
      editorialLookbook: 'اللوك بوك التحريري',
      theMonograph: 'المانيفستو / الفلسفة',
      footerTagLeft: 'ORRA BIT هوديز',
      footerTagRight: 'القاهرة · ميلانو · كيوتو'
    },
    hero: {
      exploreBtn: 'تصفح الكل',
      lookbookBtn: 'عرض صفحات اللوك بوك',
      featuredSilhouette: 'القطعة المختارة',
      shopSeries: 'تسوق السلسلة ←',
      craft1: 'شحن سريع ومؤمّن داخل مصر وجميع أنحاء العالم',
      craft2: 'قطن مصري ثقيل فاخر 100%',
      craft3: 'هندسة ستريت وير أوفرسايز · المجموعة 04'
    },
    filter: {
      filterPrefix: 'تصفية:',
      clear: 'مسح',
      showing: 'عرض',
      of: 'من',
      works: 'قطعة',
      sortLabel: 'الترتيب:',
      sortFeatured: 'المختارات المميزة',
      sortPriceAsc: 'السعر: من الأقل للأعلى',
      sortPriceDesc: 'السعر: من الأعلى للأقل',
      sortName: 'ترتيب أبجدي',
      view4: 'عرض 4 أعمدة',
      view3: 'عرض 3 أعمدة',
      viewLookbook: 'عرض اللوك بوك'
    },
    catalog: {
      archivePrefix: 'الأرشيف المختار',
      permanentCollection: 'المجموعة الدائمة',
      architectureSuffix: 'تشكيلة',
      framingLabel: 'تأطير عمودي 3:4',
      pieces: 'قطعة',
      noPiecesTitle: 'لا توجد قطع في الأرشيف',
      noMatchingTitle: 'لا توجد نتائج مطابقة',
      noPiecesBody: 'لا توجد منتجات متاحة حاليًا في قاعدة البيانات.',
      noMatchingBody:
        'لا توجد قطع تطابق معايير البحث الحالية. يمكنك مسح التصفية أو استعراض المجموعة الأساسية.',
      resetFilters: 'إعادة ضبط الفلاتر',
      addInAdmin: 'إضافة منتجات من لوحة التحكم',
      manufacturingEssay: 'مقال التصنيع // 04',
      readMonograph: 'اقرأ المانيفستو الكامل',
      loadingDb: 'جاري تحميل المجموعة المباشرة من السحابة...',
      dbReadyEyebrow: 'ORRA BIT // قاعدة البيانات',
      dbReadyTitle: 'قاعدة البيانات جاهزة للتهيئة الأولية',
      dbReadyBody:
        'المتجر متصل بقاعدة البيانات. افتح لوحة التحكم وسجل الدخول بحساب الإدارة لإضافة الكتالوج الأولي أو منتجاتك.',
      openDashboard: 'فتح لوحة التحكم',
      dismiss: 'إغلاق',
      addedToBagToast: 'تمت الإضافة إلى الحقيبة',
      removedWishlistToast: 'تمت الإزالة من المحفوظات',
      savedWishlistToast: 'تم الحفظ في الأرشيف',
      signedOutToast: 'تم تسجيل الخروج بنجاح'
    },
    card: {
      newEdition: 'إصدار جديد',
      instantSelect: 'اختيار سريع للمقاس',
      added: 'تمت الإضافة',
      sizeLabel: 'المقاس:',
      addWishlist: 'حفظ في المفضلة',
      removeWishlist: 'إزالة من المفضلة'
    },
    pdp: {
      color: 'اللون:',
      selectSize: 'اختر المقاس',
      sizingMonograph: 'دليل المقاسات',
      cutMatrixTitle: 'مصفوفة مقاسات القصّة المعمارية (بالبوصة)',
      chestS: 'S: الصدر 38',
      chestM: 'M: الصدر 40',
      chestL: 'L: الصدر 42',
      chestXL: 'XL: الصدر 44',
      sizingNote: 'مُفصل بقصّة أوفرسايز معمارية متوازنة. اختر مقاسك المعتاد للحصول على نفس الإطلالة.',
      addToBag: 'إضافة إلى الحقيبة',
      addedToBag: 'تمت الإضافة للحقيبة',
      saveArchive: 'حفظ في الأرشيف',
      savedArchive: 'محفوظ في الأرشيف',
      materialsTitle: 'الخامة والمصدر',
      compositionLabel: 'التكوين:',
      originLabel: 'المنشأ:',
      fitTitle: 'القصّة والمقاس المعماري',
      careTitle: 'العناية والحفظ',
      shippingTitle: 'شحن مؤمّن وتغليف فاخر',
      shippingBody1: 'يُشحن في صندوق حفظ مقوّى مع غطاء حماية خاص للقطعة.',
      shippingBody2: 'إمكانية الاسترجاع المؤمّن خلال 14 يومًا عبر شركة الشحن.',
      dispatchNote: 'تجهيز وشحن فوري في اليوم التالي من أتيليه أورا بيت'
    },
    cart: {
      title: 'حقيبة التسوق',
      items: 'قطع',
      freeUnlocked: 'تم تفعيل الشحن المجاني المؤمّن',
      addPrefix: 'أضف',
      addSuffix: 'ج.م للحصول على شحن مجاني',
      voidTitle: 'فارغة',
      voidBody: 'حقيبة التسوق فارغة حاليًا. استكشف مجموعة هوديز أوفاين لبدء التسوق.',
      exploreHoodies: 'تصفح الهوديز',
      sizeLabel: 'المقاس:',
      subtotal: 'المجموع الفرعي',
      delivery: 'رسوم التوصيل',
      complimentary: 'مجاني',
      taxes: 'التغليف والضرائب',
      included: 'شامل',
      total: 'الإجمالي',
      proceedCheckout: 'إتمام الطلب',
      authenticNote: 'توصيل مباشر أصلي من أتيليه أوفاين'
    },
    wishlist: {
      title: 'القطع المحفوظة',
      pieces: 'قطعة',
      emptyTitle: 'لا توجد عناصر',
      emptyBody: 'لم تقم بحفظ أي قطعة بعد. اضغط على أيقونة القلب في أي منتج لحفظه في أرشيفك.',
      exploreCollection: 'تصفح المجموعة',
      addLabel: 'إضافة:',
      reservedNote: 'تبقى العناصر محفوظة في أرشيف متصفحك',
      continueBrowsing: 'مواصلة التصفح'
    },
    search: {
      title: 'البحث في الأرشيف',
      placeholder: 'ابحث باسم القطعة، اللون، الخامة، أو الكود...',
      filterAll: 'تصفية الكل',
      curatedQueries: 'عمليات بحث مقترحة:',
      matchingWorks: 'النتائج المطابقة',
      pressEnter: 'اضغط Enter لتطبيق التصفية',
      noFoundTitle: 'لا توجد نتائج مطابقة',
      noFoundHint: 'جرب البحث عن "Rise Again" أو "Counter Culture" أو "Oversized" أو "Navy"',
      trending: ['Rise Again', 'Counter Culture', 'Ace of Spades', 'Black Oversized', 'Burgundy']
    },
    lookbook: {
      eyebrow1: 'صفحات معمارية',
      eyebrow2: 'كتالوج اللوك بوك',
      title: 'دراسة المونوليث',
      subtitle:
        'حوار بصري يلتقط هندسة القصّة الواسعة أمام الأسطح المعمارية الصلبة. اضغط على أي قطعة مميزة لمعاينة مواصفاتها.',
      chapter: 'الفصل',
      figure: 'شكل',
      detail: 'تفصيل',
      worksFeatured: 'القطع المعروضة في هذا الفصل',
      pieces: 'قطعة'
    },
    monograph: {
      subtitle: 'البيان المعماري للعلامة',
      s1Eyebrow: '01. المينيمالية المعمارية',
      s1Title: 'إتقان الفراغ والشكل',
      s1Quote:
        '«لا تتحقق الفخامة الملموسة بالزخارف الزائفة، بل من خلال خطوط هيكلية دقيقة، نسب مدروسة، وتوازن المساحات الفارغة بما يشبه كتابًا فنيًا فاخرًا.»',
      s1Body:
        'وُلدت ORRA BIT كرد فعل واعٍ ضد الأزياء المؤقتة والزينة المفرطة. نبتعد عن التفاصيل العابرة لصالح أشكال معمارية دائمة بخطوط حادة وانضباط هندسي يترك للخامة النقية مساحة الحضور الكاملة.',
      s2Eyebrow: '02. مصادر الأتيليه والحرفية',
      atelier1City: 'بييلا، إيطاليا',
      atelier1Sub: 'نسيج الصوف البكر',
      atelier1Body:
        'أنسجة مزدوجة الوجه بكثافة 480 GSM تمنح كثافة ملموسة ومتانة طبيعية لا مثيل لها.',
      atelier2City: 'كيوتو، اليابان',
      atelier2Sub: 'حياكة دائرية متصلة',
      atelier2Body:
        'بناء ثلاثي الأبعاد للقطعة بالكامل يلغي احتكاك خياطة الأكتاف ويضمن ثبات الهيكل مع الزمن.',
      atelier3City: 'فلورنسا، إيطاليا',
      atelier3Sub: 'تشطيب ودقة التفاصيل',
      atelier3Body:
        'معالجة نسيجية متقنة تضمن ثبات الشكل والانسيابية وعمق اللون على المدى الطويل.',
      archiveFooter: 'أرشيف ORRA BIT · خريف / شتاء 2026',
      exploreBtn: 'استعرض قطع المجموعة 04'
    },
    checkout: {
      stepDetails: 'الخطوة 1: عنوان التوصيل',
      stepPayment: 'الخطوة 2: وسيلة الدفع',
      stepConfirmed: 'تم تأكيد الطلب',
      dispatchConfirm: 'تأكيد الشحن والطلب',
      orderHeading: 'طلب رقم',
      receiptSentPrefix: 'تم إرسال إيصال التأكيد إلى',
      receiptSentMid: 'سيتواصل معك فريق التوصيل عبر الرقم',
      shipmentDest: 'وجهة الشحن:',
      estimatedDelivery: 'موعد التوصيل المتوقع:',
      deliveryDays: '2–4 أيام عمل',
      paymentMethodLabel: 'وسيلة الدفع:',
      dueOnDelivery: 'المبلغ المطلوب عند الاستلام:',
      totalSettled: 'إجمالي المدفوع:',
      printReceipt: 'طباعة الإيصال',
      returnArchive: 'العودة للمتجر',
      section1Title: '1. بيانات العميل والعنوان',
      allRequired: 'جميع الحقول مطلوبة',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      email: 'البريد الإلكتروني',
      mobile: 'رقم الموبايل',
      streetAddress: 'العنوان بالتفصيل',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      country: 'الدولة',
      deliveryMethodLabel: 'طريقة التوصيل',
      expressCourier: 'شحن سريع مؤمّن',
      expressDesc: '2–4 أيام عمل · مصر وجميع أنحاء العالم',
      free: 'مجاني',
      continuePayment: 'المتابعة للدفع',
      editDestination: 'تعديل العنوان',
      secureCheckout: 'دفع آمن',
      deliveringTo: 'التوصيل إلى:',
      selectPaymentTitle: 'اختر وسيلة الدفع',
      instapayTitle: 'انستا باي — InstaPay',
      instapayDesc: 'تحويل بنكي فوري عبر عنوان IPA أو رقم الهاتف',
      instantBadge: 'فوري',
      instapayIpaLabel: 'عنوان انستا باي الخاص بـ ORRA BIT',
      copyIpa: 'نسخ العنوان',
      copied: 'تم النسخ',
      yourIpaLabel: 'عنوان انستا باي الخاص بك أو رقم مرجع التحويل',
      yourIpaPlaceholder: 'مثال: name@instapay أو رقم العملية',
      vodafoneTitle: 'فودافون كاش — Vodafone Cash',
      vodafoneDesc: 'تحويل مباشر من محفظة الهاتف',
      walletBadge: 'محفظة',
      walletNumberLabel: 'رقم محفظة ORRA BIT',
      copyNumber: 'نسخ الرقم',
      senderVodafoneLabel: 'رقم فودافون كاش المُحوِّل منه',
      codTitle: 'الدفع عند الاستلام',
      codDesc: 'ادفع نقدًا عند وصول المندوب ومعاينة الطلب',
      codBadge: 'عند الاستلام',
      totalDueDelivery: 'المبلغ المستحق عند الاستلام:',
      courierCallPrefix: 'سيتصل بك المندوب على',
      courierCallSuffix: 'قبل الوصول.',
      deliveryNotesLabel: 'ملاحظات التوصيل (اختياري)',
      deliveryNotesPlaceholder: 'الدور، الشقة، أو الوقت المفضل للتوصيل',
      savePrefs: 'حفظ بيانات الشحن للطلبات القادمة',
      googlePrompt:
        'لتسجيل وحفظ طلبك في قاعدة البيانات بشكل دائم وآمن، يرجى تأكيد هويتك عبر Google:',
      signingIn: 'جاري تسجيل الدخول...',
      signInGoogle: 'تسجيل الدخول عبر Google لتأكيد الطلب',
      openNewTab: 'فتح الموقع في تبويب مستقل لتسجيل الدخول',
      savingOrder: 'جاري حفظ الطلب في قاعدة البيانات...',
      confirmCod: 'تأكيد طلب الدفع عند الاستلام',
      confirmOrder: 'تأكيد الطلب',
      curatedItems: 'ملخص القطع المختارة',
      qty: 'الكمية',
      size: 'المقاس',
      subtotal: 'المجموع الفرعي',
      insuredCourier: 'الشحن المؤمّن',
      complimentary: 'مجاني',
      packagingTaxes: 'التغليف والضرائب',
      included: 'شامل',
      total: 'الإجمالي',
      certificateNote: 'يشمل صندوق الحفظ الأرشيفي وشهادة الأصالة المرقّمة',
      signInRequiredError: 'يرجى تسجيل الدخول بحساب Google أولاً لحفظ طلبك بشكل دائم في قاعدة البيانات.',
      orderSaveFailedError: 'فشل حفظ الطلب في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
      orderSaveFailedPrefix: 'فشل حفظ الطلب:'
    },
    footer: {
      brandDesc:
        'دار أزياء معمارية تستكشف التوازن بين الفراغ والكتلة البنائية. متخصصة في القطن الثقيل بكثافة 550 GSM، وتصميم الهود مزدوج الطبقات المتماسك.',
      permanentLabel: 'الأرشيف الدائم // مجموعة هوديز 04',
      seriesHeading: 'سلاسل الهوديز',
      monographHeading: 'المانيفستو',
      lookbookSpreads: 'صفحات اللوك بوك',
      brandManifesto: 'بيان العلامة التجارية',
      service1: 'الحفاظ على القطن الثقيل',
      service2: 'تفصيل المقاسات المعمارية',
      service3: 'الشحن العالمي المؤمّن',
      newsletterTitle: 'النشرة البريدية الحصرية',
      newsletterBody:
        'احصل على دعوات خاصة لإصدارات الهوديز الموسمية، القطع المرقّمة، والعروض الحصرية.',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      enroll: 'اشتراك',
      enrolled: 'تم الاشتراك',
      receiptConfirmed: '✓ تم تأكيد اشتراكك. أهلاً بك في دائرة ORRA BIT.',
      rights: 'ORRA BIT أتيليه. جميع الحقوق محفوظة.',
      cities: ['بورتو', 'ميلانو', 'كيوتو', 'باريس'],
      matrixBadge: 'مصفوفة الهودي المعماري 550 GSM'
    }
  }
};
