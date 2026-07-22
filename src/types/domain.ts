import type { GenericId } from "convex/values";

export type Id<Table extends string> = GenericId<Table>;
export type FileId = Id<"_storage">;
export type CustomerId = Id<"customers">;
export type SareeId = Id<"sarees">;
export type LookId = Id<"looks">;

export type AuthUser = {
  phone: string;
  name: string;
  role: "customer";
  customerId: CustomerId;
};

export type Session = {
  phone: string;
  role: string;
  expiresAt?: number;
};

export type Customer = {
  _id: CustomerId;
  name?: string;
  phone?: string;
  initials?: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  heightUnit?: string;
  email?: string;
  city?: string;
  photoFileId?: FileId;
  language?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  storeCredit?: number;
  preferredOccasions?: string[];
  preferredFabrics?: string[];
  preferredColors?: string[];
  budgetRange?: string;
  upcomingOccasion?: string;
  upcomingOccasionDate?: string;
  consentHistory?: boolean;
  consentMessages?: boolean;
  consentAiPersonal?: boolean;
  consentPhotos?: boolean;
};

export type StoreLink = {
  _id: Id<"customerStoreLinks">;
  storeId: string;
  storeName?: string;
  storeCity?: string;
  storeState?: string;
  storeAddress?: string;
  storeHours?: string;
  phone?: string;
  visits?: number;
  lastVisit?: string;
  clv?: number;
  logoUrl?: string | null;
};

export type Look = {
  _id: LookId;
  sareeId: SareeId;
  storeId?: string;
  sareeName?: string;
  sareeOccasion?: string;
  fabric?: string;
  price?: number;
  createdAt?: number;
  status?: string;
  sareeGrad?: string[];
  imageFileId?: FileId;
  imageNoBgFileId?: FileId;
  sareeImageId?: FileId;
};

export type Saree = {
  _id: SareeId;
  storeId: string;
  name: string;
  price?: number;
  fabric?: string;
  occasion?: string;
  colorName?: string;
  colors?: string[];
  region?: string;
  weave?: string;
  type?: string;
  description?: string;
  careInstructions?: string;
  drapingStyles?: string[];
  stock?: number;
  status?: string;
  grad?: string[];
  imageIds?: FileId[];
};

export type WishlistItem = {
  _id: Id<"wishlist">;
  sareeId: SareeId;
  storeId: string;
  sareeName: string;
  price?: number;
  sareeOccasion?: string;
  sareeGrad?: string[];
  sareeImageId?: FileId;
  storeCity?: string;
  storeName?: string;
  lookId?: LookId;
  lookImageFileId?: FileId;
  lookImageNoBgFileId?: FileId;
};

export type WardrobeItem = {
  _id: Id<"wardrobe">;
  sareeId: SareeId;
  sareeName?: string;
  price?: number;
  sareeOccasion?: string;
  sareeGrad?: string[];
  sareeImageId?: FileId;
  lookId?: LookId;
  lookImageFileId?: FileId;
  lookImageNoBgFileId?: FileId;
  _creationTime?: number;
};

export type LoyaltyTransaction = {
  _id: Id<"loyaltyTransactions">;
  date?: string;
  points?: number;
  reason?: string;
  type?: string;
  storeName?: string;
};

export type Referral = {
  _id: Id<"customerReferrals">;
  referredName?: string;
  referredPhone?: string;
  status?: string;
  reward?: number;
  date?: string;
};

export type TailorOrder = {
  _id: Id<"tailorOrders">;
  orderId?: string;
  tailorName?: string;
  tailorWhatsapp?: string;
  service?: string;
  saree?: string;
  fabric?: string;
  status?: string;
  orderDate?: string;
  dueDate?: string;
  priceQuoted?: number;
  depositPaid?: number;
  note?: string;
  rating?: number;
  ratingComment?: string;
};

export type LoginResult = {
  success: boolean;
  token?: string;
  customerId?: CustomerId;
  error?: string;
  errorCode?: string;
};
