# Wearify Customer Mobile Source Audit

Baseline captured 2026-07-22 from `/home/vrathik/wearify-claude/wearify`.
The source checkout is on `main` at `104d740` with local changes in generated
Convex guidance and package metadata. The current working tree, rather than the
commit alone, is the visual and behavioral source of truth.

## Scope

The native application reproduces only the customer PWA rooted at `/c`.
The source also contains `/admin`, `/store`, `/tablet`, `/kiosk`, `/tailor`, and
`/scanner`; they share the backend but are not mobile routes in this project.

## Source folders

| Folder | Purpose | Mobile treatment |
| --- | --- | --- |
| `app/c` | 23 customer pages, customer shell, auth gates, and local customer components | Reimplemented as Expo Router screens |
| `components` | Cross-surface Convex provider, media, toast, and small customer UI | Reuse behavior; rebuild DOM components natively |
| `lib` | Phone auth helpers, upload guards, upload pipeline, image resolution, i18n, and browser-only background removal | Copy portable logic; replace browser APIs |
| `convex` | Schema, generated API, queries, mutations, actions, authz, storage, and external integrations | Contract snapshot only; deployed backend is unchanged |
| `public/customer` | 87 customer SVG, PNG, and MP4 assets | Copy into the native asset bundle |
| `public` | Shared Wearify logo and PWA metadata/icons | Copy only required brand assets |
| `docs` | Product history, issue audit, credentials, and prior implementation notes | Reference only; never package credentials |

## Routing matrix

All private routes require a valid `phoneAuth.validateSession` result with role
`customer`. Public routes are welcome, login, registration, and offline.

| Web route | Purpose and inputs | Convex/data output | Navigation |
| --- | --- | --- | --- |
| `/c/welcome` | Branded entry screen | None | Register or login |
| `/c/login` | Indian phone and six-digit OTP | `sendOtp`, `verifyOtp`, `loginWithOtp`; stores token/user | Home or registration |
| `/c/register` | Phone, OTP, name, DOB | OTP functions, `loginWithOtp`, `completeProfile` | Home |
| `/c` | Home summary for the signed-in customer | Store links and recent looks | Profile, new arrivals, looks, wardrobe, stores |
| `/c/looks` | Filterable/grid history of try-on looks | Looks, stores, wishlist; wishlist mutations | Look detail |
| `/c/looks/[id]` | Raw/cutout look comparison and sharing | Customer looks, wishlist, saree record, file URLs | Related look detail or back |
| `/c/new` | Store-filtered new arrivals | Store links and new-arrival sarees | Product detail |
| `/c/product/[id]` | Saree image, metadata, wishlist and sharing | Saree, wishlist, file URL | Back |
| `/c/wardrobe` | Saved kiosk wardrobe carousel/grid | Wardrobe rows and look media | Back |
| `/c/wishlist` | Hearted customer items | Wishlist and removal mutation | Product/look content |
| `/c/me` | Profile hub and activity counts | Store links, wishlist, looks, visits, photo URL | Profile child routes or logout |
| `/c/me/profile` | Edit customer identity and photo | Customer record, upload URL, file URL, `updateProfile` | Profile hub |
| `/c/me/stores` | Connected store list and detail | Current implementation uses local presentation data | WhatsApp/maps or back |
| `/c/me/history` | Store visit history | Enriched store links | Profile hub |
| `/c/me/loyalty` | Credits balance and ledger | Customer and loyalty transactions | Back |
| `/c/me/preferences` | Style, color, fabric, budget preferences | Customer and `updatePreferences` | Back |
| `/c/me/language` | Preferred language | Customer and `updateProfile` | Back |
| `/c/me/privacy` | Consent, JSON export, and account deletion | Customer, `updateConsent`, `getDataExport`, `deleteMyData` | Welcome after deletion |
| `/c/me/feedback` | Store selection, rating, and comments | Store links and `submitFeedback` | Profile hub |
| `/c/me/refer` | Create/list referrals and share invite | `createReferral`, `listReferrals` | Referral code |
| `/c/me/refer/code` | Display/share generated referral code | Route state | Back |
| `/c/me/tailor-orders` | Customer tailoring order history and rating | `listOrdersByCustomer`, `rateOrder` | WhatsApp tailor or back |
| `/c/offline` | Connection failure state | Browser online event in PWA | Retry/back to app |

The authenticated shell supplies the five tabs: Home, Looks, New, Wardrobe,
and Wishlist. Detail and profile pages remain within the authenticated shell.

## Reusable UI inventory

- Navigation/layout: customer shell, centered tablet frame, app bars, bottom
  navigation, splash screen, offline screen, and copyright bands.
- UI: primary/secondary buttons, icon buttons, chips, tabs, badges, counters,
  toast messages, skeleton/loading indicators, empty/error states, and dialogs.
- Forms: phone keypad, OTP cells, registration details, profile editor,
  preferences, consent controls, feedback, rating, and referral entry.
- Cards/lists: look cards, store cards, arrival/product cards, wardrobe media,
  loyalty ledger, referral cards, and tailor order timeline.
- Media: Convex image resolver, raw/cutout `LookMedia`, image lightbox, profile
  photo picker/uploader, and the skippable preparation advertisement.

DOM, CSS masking, hover, `<video>`, `<input type=file>`, `window.open`, blob
downloads, and browser WASM are not reusable implementations. Their behavior
and visual result are reusable requirements.

## Convex contract used by `/c`

### Authentication

- `phoneAuth.sendOtp` action sends a six-digit MSG91 OTP, or uses explicitly
  enabled development mode.
- `phoneAuth.verifyOtp` action rate-limits and verifies the OTP, then marks its
  short-lived server session verified.
- `phoneAuth.loginWithOtp` mutation consumes verified OTP state and creates a
  30-day random bearer session for an existing customer.
- `phoneAuth.validateSession` query returns the authoritative active session or
  `null` after expiry/revocation.
- `phoneAuth.logout` mutation deletes the presented session.

The customer PWA does not use Better Auth. Its token is passed explicitly as an
optional `token` argument. Server functions resolve the session and derive the
authoritative customer identity; client-supplied identifiers do not grant
access.

### Customer and commerce

- Profile: `customers.getByPhone`, `getById`, `completeProfile`,
  `updateProfile`, `updatePreferences`, and `updateConsent`.
- Stores/activity: `listStoreLinksEnriched`, `listVisitHistory`,
  `getLoyaltyTransactions`, and `listNewArrivalsForCustomer`.
- Wishlist: `getWishlist`, `addToWishlist`, and `removeFromWishlist`.
- Referrals/feedback: `createReferral`, `listReferrals`, and `submitFeedback`.
- Privacy: `getDataExport` returns bounded customer-owned records;
  `deleteMyData` deletes/anonymizes the customer graph.
- Looks/wardrobe: `sessionOps.listByCustomer` and
  `listWardrobeByCustomer` provide reactive customer-owned records.
- Product: `sarees.getById` returns the selected catalogue record.
- Tailoring: `tailorOps.listOrdersByCustomer` and `rateOrder` expose the
  customer-owned order lifecycle.

### Files and cutouts

- `files.getUrl` resolves Convex Storage IDs to serving URLs.
- `files.generateUploadUrl` requires a valid principal before issuing a
  short-lived upload URL.
- `tryOn.attachBgRemovedImage` and `deleteOrphanCutout` are used by the web
  browser's background-removal queue. Mobile will not call them because the
  browser-only IMG.LY WASM implementation is not React Native compatible.
- Client upload validation mirrors server validation. Customer profile photos
  accept images up to 4 MB; the server remains the security boundary.

## Schema relationships relevant to mobile

- A customer is resolved from the authenticated user's canonical phone.
- `customerStoreLinks`, `visitHistory`, `loyaltyTransactions`, `wishlist`,
  `looks`, `wardrobe`, `sessions`, referrals, feedback, and tailor orders link
  back to the customer ID.
- Looks and wardrobe rows link to sarees, stores, sessions, and Convex Storage
  IDs for catalogue, raw try-on, and optional transparent cutout images.
- Queries use customer/store/session indexes and return bounded result sets;
  mobile must consume the existing order and limits rather than client-side
  full-table scans.

## Data and state flow

```text
Press / form submit
  -> native screen or feature hook
  -> Convex query, mutation, or action with SecureStore session token
  -> existing server validation and authorization
  -> Convex database or storage
  -> live query subscription update
  -> screen rerender
```

- Global state is limited to hydrated authentication/customer context and
  transient connectivity state.
- Convex hooks own server data and live subscriptions. There is no React Query
  cache in the source.
- Screen filters, selected tabs, dialog state, and form drafts remain local.
- Loading is represented by `undefined`, empty data by an empty collection,
  authorization failure by session clearing, and operational failures by an
  inline state or toast.

## Native differences approved for v1

- Tokens move from `localStorage` to encrypted platform SecureStore.
- Offline writes are blocked; no durable mutation replay queue is introduced.
- Existing cutouts render normally. Missing cutouts show the existing raw-image
  fallback and are not generated on-device.
- File input/download becomes native image picking and FileSystem/Sharing.
- External windows become validated Linking/Sharing actions.
- The browser video element becomes `expo-video`.
- Notification bells remain non-functional until the backend can store push
  tokens and dispatch notifications; no permission prompt is shown.
- The existing light-only theme stays light-only.

