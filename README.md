# EventBooking — Client (React)

The React client for the [EventBooking server](../project-dotnet). Adapted to the **v2 server**
(roles Customer / Manager / Admin, event types, catering menus, server-side price calculation).

## Stack

| | |
|---|---|
| Build | Vite 5 + React 18 |
| UI | **Mantine 7** (components + theming, RTL) |
| Animation | **Framer Motion** — page transitions, staggered cards, live price |
| Icons | `@tabler/icons-react` |
| Routing | `react-router-dom` 6 |
| Data | plain `fetch` wrapper in `src/api.js` |
| Fonts | Assistant / Heebo (Google Fonts) |

## Prerequisites

- Node.js 18+
- The **EventBooking server running** on `http://localhost:5269`
  (`dotnet run --project EventBooking.API`). Its CORS policy already allows this origin
  (`http://localhost:5173`).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

Set `VITE_API_URL` in a `.env` file if your server runs elsewhere.

## Screens

| Route | Screen | Server endpoints |
|---|---|---|
| `/` | Landing — festive hero, "how it works", event types | `GET /api/event-types` |
| `/login` | Login / Register (JWT, role-aware) | `POST /api/auth/login` · `/register` |
| `/slots` | Browse hall-slots — date range + price sort + status filter, **real server pagination**, animated cards | `GET /api/hall-slots?page=&pageSize=&status=&sortBy=&fromDate=&toDate=` |
| `/book/:slotId` | Event builder — event type, host, guests, catering menu, extra services (filtered by event type), **live price** that animates as you change the selection, confirm → clear **409** panel | `GET /api/hall-slots/{id}` · `/api/event-types` · `/api/catering-menus` · `/api/extra-services` · `POST /api/pricing/estimate` · `POST /api/bookings` |
| `/my-bookings` | My bookings — cards, status badges, cancel (with confirm modal) | `GET /api/bookings/mine` · `DELETE /api/bookings/{id}` |
| `/manage` | Manager only — table of all bookings, filter by status, approve / reject | `GET /api/bookings?status=` · `PATCH /api/bookings/{id}/status` |

## Demo users

| Role | Email | Password |
|---|---|---|
| Customer | `client@eventbooking.local` | `Passw0rd!` |
| Manager | `manager@eventbooking.local` | `Passw0rd!` |
| Admin | `admin@eventbooking.local` | `Passw0rd!` |

Only a **Customer** sees "הזמנה" on a slot and can book. A **Manager** gets the ניהול area.

## How to see the 409 path

1. Log in as the customer, open a slot, fill the builder, confirm — lands on "my bookings".
2. From Swagger (or a second browser) book the **same** slot again, then in the client try to
   confirm it — the server returns 409 and the builder shows the "התאריך נתפס" panel.

## Layout

```
src/
  api.js               one fetch wrapper, all endpoints grouped by feature
  auth.jsx             AuthContext (token + user in localStorage, isCustomer/isManager)
  theme.js             Mantine theme (grape/pink/gold palette) + status colors
  App.jsx              routes + AnimatePresence page transitions
  components/
    AppLayout.jsx      AppShell header, role-aware nav, user menu
    Motion.jsx         PageTransition + stagger/popIn variants
    PriceSummary.jsx   sticky, animated price breakdown
    StatusBadge.jsx
  pages/               LandingPage, LoginPage, SlotsPage, BookPage, MyBookingsPage, ManagerPage
```
