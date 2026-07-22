import { makeFunctionReference, type DefaultFunctionArgs } from "convex/server";
import type {
  Customer,
  CustomerId,
  FileId,
  LoginResult,
  Look,
  LoyaltyTransaction,
  Referral,
  Saree,
  SareeId,
  Session,
  StoreLink,
  TailorOrder,
  WardrobeItem,
  WishlistItem,
} from "@/src/types/domain";

type Token = { token?: string };
const query = <Args extends DefaultFunctionArgs, Result>(name: string) =>
  makeFunctionReference<"query", Args, Result>(name);
const mutation = <Args extends DefaultFunctionArgs, Result>(name: string) =>
  makeFunctionReference<"mutation", Args, Result>(name);
const action = <Args extends DefaultFunctionArgs, Result>(name: string) =>
  makeFunctionReference<"action", Args, Result>(name);

export const api = {
  phoneAuth: {
    sendOtp: action<{ phone: string }, { success: boolean; devMode?: boolean; error?: string }>("phoneAuth:sendOtp"),
    verifyOtp: action<{ phone: string; otp: string }, { success: boolean; error?: string }>("phoneAuth:verifyOtp"),
    loginWithOtp: mutation<{ phone: string; otp: string; role: string; name?: string; allowCreate?: boolean }, LoginResult>("phoneAuth:loginWithOtp"),
    validateSession: query<{ token: string }, Session | null>("phoneAuth:validateSession"),
    logout: mutation<{ token: string }, null>("phoneAuth:logout"),
  },
  customers: {
    getByPhone: query<{ phone: string; token?: string }, Customer | null>("customers:getByPhone"),
    getById: query<{ customerId: CustomerId; token?: string }, Customer | null>("customers:getById"),
    completeProfile: mutation<Token & { customerId: CustomerId; name: string; dateOfBirth: string; gender: string; heightCm: number; heightUnit?: string; city: string; email?: string; photoFileId?: FileId; language?: string }, { success: boolean }>("customers:completeProfile"),
    updateProfile: mutation<Token & { customerId: CustomerId; name?: string; initials?: string; dateOfBirth?: string; gender?: string; heightCm?: number; heightUnit?: string; email?: string; city?: string; photoFileId?: FileId; language?: string }, null>("customers:updateProfile"),
    updatePreferences: mutation<Token & { customerId: CustomerId; preferredOccasions?: string[]; preferredFabrics?: string[]; preferredColors?: string[]; budgetRange?: string; upcomingOccasion?: string; upcomingOccasionDate?: string; city?: string }, null>("customers:updatePreferences"),
    updateConsent: mutation<Token & { customerId: CustomerId; consentHistory?: boolean; consentMessages?: boolean; consentAiPersonal?: boolean; consentPhotos?: boolean; consentGrantedDate?: string }, null>("customers:updateConsent"),
    listStoreLinksEnriched: query<Token & { customerId: CustomerId }, StoreLink[]>("customers:listStoreLinksEnriched"),
    listNewArrivalsForCustomer: query<Token & { customerId: CustomerId }, Record<string, { storeId: string; storeName: string; sarees: Saree[] }>>("customers:listNewArrivalsForCustomer"),
    listVisitHistory: query<Token & { customerId: CustomerId }, StoreLink[]>("customers:listVisitHistory"),
    getLoyaltyTransactions: query<Token & { customerId: CustomerId }, LoyaltyTransaction[]>("customers:getLoyaltyTransactions"),
    getWishlist: query<Token & { customerId: CustomerId }, WishlistItem[]>("customers:getWishlist"),
    addToWishlist: mutation<Token & { customerId: CustomerId; sareeId: SareeId; storeId: string; sareeName: string; price?: number }, string>("customers:addToWishlist"),
    removeFromWishlist: mutation<Token & { wishlistId: WishlistItem["_id"] }, null>("customers:removeFromWishlist"),
    createReferral: mutation<Token & { referrerId: CustomerId; referrerPhone: string; referredName: string; referredPhone?: string; status: string; reward?: number; date: string }, string>("customers:createReferral"),
    listReferrals: query<Token & { referrerId: CustomerId }, Referral[]>("customers:listReferrals"),
    submitFeedback: mutation<Token & { customerId?: CustomerId; customerPhone?: string; storeId: string; sessionId?: string; rating: number; chips?: string[]; comment?: string; date: string }, string>("customers:submitFeedback"),
    getDataExport: query<Token & { customerId: CustomerId }, Record<string, unknown>>("customers:getDataExport"),
    deleteMyData: mutation<Token & { customerId: CustomerId }, { success: boolean }>("customers:deleteMyData"),
  },
  sessionOps: {
    listByCustomer: query<Token & { customerId: CustomerId }, Look[]>("sessionOps:listByCustomer"),
    listWardrobeByCustomer: query<Token & { customerId: CustomerId }, WardrobeItem[]>("sessionOps:listWardrobeByCustomer"),
  },
  sarees: {
    getById: query<{ id: SareeId }, Saree | null>("sarees:getById"),
  },
  files: {
    getUrl: query<{ fileId: FileId }, string | null>("files:getUrl"),
    generateUploadUrl: mutation<Token & { deviceToken?: string }, string>("files:generateUploadUrl"),
  },
  tailorOps: {
    listOrdersByCustomer: query<Token & { customerPhone: string }, TailorOrder[]>("tailorOps:listOrdersByCustomer"),
    rateOrder: mutation<Token & { id: TailorOrder["_id"]; rating: number; ratingComment?: string }, null>("tailorOps:rateOrder"),
  },
};
