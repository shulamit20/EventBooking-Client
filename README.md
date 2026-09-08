# EventBooking — Client (React)

The minimal React client for the [EventBooking server](../project-dotnet). It exists only to prove
the server works end to end — design and code quality are deliberately kept small.

## Prerequisites

- Node.js 18+ (`node --version`)
- The **EventBooking server running** on `http://localhost:5269` (`dotnet run --project EventBooking.API`
  in the server solution). The server's CORS policy already allows this client's origin
  (`http://localhost:5173`).

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

If your server runs on a different URL, create a `.env` file:

```
VITE_API_URL=http://localhost:5269
```

## The four screens

| Route | Screen | What it shows |
|---|---|---|
| `/login` | Login / Register | one form, tabs to switch. Stores the JWT in `localStorage`; `src/api.js` adds it as `Authorization: Bearer …` on every request. |
| `/` | Slots list | `GET /api/hall-slots?page=&pageSize=` — **real server pagination** (Prev / Next, page X of Y, total count). |
| `/book/:slotId` | Book a slot | `POST /api/bookings` — the action on the limited resource. |
| `/book/:slotId` (409 state) | Slot taken | if the server answers **409**, a clear "התאריך נתפס" message instead of a generic error. |
| `/my-bookings` | My bookings | `GET /api/bookings/mine`, with cancel (`DELETE /api/bookings/{id}`). |

## Demo users

| Role | Email | Password |
|---|---|---|
| Customer | `client@eventbooking.local` | `Passw0rd!` |
| Admin | `admin@eventbooking.local` | `Passw0rd!` |
| Manager | `manager@eventbooking.local` | `Passw0rd!` |

Only a **Customer** sees the "הזמנה" button (the server rejects a Manager booking with 403).

## How to see the 409 path

1. Log in as the client, book an available slot → lands on "My bookings".
2. In Swagger (or a second browser), book the **same** slot again, or reload and try to book it
   from the list — the server returns 409 and the client shows the "slot taken" screen.

## Project layout

```
src/
  api.js        one fetch wrapper — base URL, JWT header, throws ApiError with .status
  auth.jsx      AuthContext — token + user in localStorage, login / register / logout
  App.jsx       routes
  components/Nav.jsx
  pages/        LoginPage, SlotsPage, BookPage, MyBookingsPage
  styles.css
```
