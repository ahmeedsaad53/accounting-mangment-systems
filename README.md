# Accounting Management System

A full‑stack accounting & billing management application built with **ASP.NET Core 10 Web API** on the backend and **React 19 + Vite** on the frontend. It provides a complete sales workflow — from managing customers and inventory to issuing invoices and visualising business performance — secured with JWT authentication and ASP.NET Core Identity.

> Internal API namespace: `zadan` · Backend project: `WebApi` · Default backend URL: `http://localhost:5097`

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

This application is designed for small businesses and shops to manage their day-to-day sales operations. Users can register and log in securely, manage their customer database and product inventory, generate invoices that automatically validate and deduct stock, and review real‑time business analytics on a unified dashboard with interactive charts. The UI is delivered in **Arabic (RTL)** and styled with **Tailwind CSS v4**.

---

## Features

### Authentication & Security
- User **registration** and **login** with ASP.NET Core Identity.
- **JWT Bearer** token issuance with claims (user id, username, roles, JTI) — 1‑hour expiry.
- Token persisted in `localStorage` and automatically attached to every request via an Axios interceptor.
- All business endpoints are guarded with the `[Authorize]` attribute.
- Role claims are embedded in the JWT to enable future RBAC.

### Customer Management
- Create, read, update, and delete customers.
- Capture name, phone, and free‑text notes.
- Customer–bill relationship preserved on customer deletion (set‑null on cascade).

### Product / Inventory Management
- Full CRUD over products (name, type, price, stock).
- Dedicated **stock adjustment** endpoint (`PUT /api/Product/add-stock/{id}`).
- Low‑stock surface on the dashboard (any product with stock `< 5`).

### Billing & Invoicing
- Create a bill with **multiple line items** in a single request.
- Smart **line aggregation**: duplicate `ProductId` entries on the same bill are grouped automatically.
- **Stock validation**: requests are rejected if any product is out of stock or quantity is invalid.
- **Atomic stock deduction** at bill creation, and **automatic stock restoration** on bill deletion.
- **Server‑side total calculation** using the product price captured at the moment of sale (snapshotted on `BillItem.Price`).
- Eager loading of customer + items + products when retrieving bills.
- **Printable invoices** powered by `react-to-print`.

### Dashboard & Analytics
- Totals: revenue, total stock, customer count, bill count.
- **Low‑stock alerts** (products under threshold).
- **Sales by day / month** trend visualisations using **Recharts** (line charts).
- Best‑selling products per current month.
- Resilient date parsing for mixed date formats coming from the API.

### UX
- Right‑to‑left Arabic interface with a fixed **Sidebar + Navbar** shell.
- Friendly confirmations and alerts via **SweetAlert2**.
- Icon set provided by **React Icons**.
- Built with **Vite** for instant HMR and fast production builds.

---

## Tech Stack

### Backend
| Layer | Technology |
| --- | --- |
| Runtime | **.NET 10** (`net10.0`) |
| Web framework | **ASP.NET Core Web API** |
| ORM | **Entity Framework Core 10** (SQL Server provider) |
| Identity | **ASP.NET Core Identity** with `IdentityDbContext<ApplicationUser>` |
| Auth | **JWT Bearer** (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| API docs | **Swashbuckle / Swagger UI** (with JWT auth scheme) |
| Database | **Microsoft SQL Server** (LocalDB / SQLEXPRESS) |
| Misc | CORS (`AllowAll` policy), `ReferenceHandler.IgnoreCycles` JSON serialization |

### Frontend
| Layer | Technology |
| --- | --- |
| Framework | **React 19** |
| Build tool | **Vite 8** (`@vitejs/plugin-react`) |
| Routing | **react-router-dom 7** |
| HTTP client | **Axios** (with request interceptor for JWT) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) |
| Charts | **Recharts 3** |
| Alerts | **SweetAlert2** |
| Icons | **React Icons** |
| Printing | **react-to-print** |
| Tooling | **ESLint 10** + React hooks / refresh plugins |

---

## Architecture

The solution follows a classic **layered Web API** pattern:

```
HTTP Request
   │
   ▼
Controllers (api/[controller])  ──►  DTOs (request/response shaping)
   │
   ▼
EF Core DbContext (AppDbContext : IdentityDbContext)
   │
   ▼
SQL Server (Zadan database)
```

- **DTOs** decouple HTTP contracts from EF entities (e.g. `BillDto`, `BillItemDto`, `CustomerDTO`, `ProductDTO`, `RegisterDTO`, `LoginDTO`).
- **`AppDbContext`** explicitly configures relationships:
  - `Bill 1..* BillItem` — cascade delete.
  - `Product 1..* BillItem` — restrict delete (cannot remove a sold product).
  - `Customer 1..* Bill` — set null on delete.
- **`ApplicationUser`** extends `IdentityUser` and is the basis for Identity authentication.

The frontend is a **single‑page application**: a top‑level `<App>` declares routes, while `services/api.js` centralises the Axios client and bearer‑token injection.

---

## Project Structure

```
accounting-mangment-systems/
├── backend/
│   ├── Controllers/
│   │   ├── AccController.cs        # Register / Login + JWT issuance
│   │   ├── BillController.cs       # Create / list / get / delete bills (+ stock logic)
│   │   ├── CustomerController.cs   # CRUD for customers
│   │   └── ProductController.cs    # CRUD for products + stock update endpoint
│   ├── Data/
│   │   ├── AppDbContex.cs          # EF Core DbContext + relationships + ApplicationUser
│   │   ├── Bill.cs
│   │   ├── BillItem.cs
│   │   ├── Customer.cs
│   │   └── Product.cs
│   ├── DTO/
│   │   ├── BillDto.cs / BillItemDto.cs
│   │   ├── CustomerDTO.cs
│   │   ├── ProductDTO.cs
│   │   ├── LoginDTO.cs
│   │   └── RegisterDTO.cs
│   ├── Migrations/                 # EF Core migrations
│   ├── Program.cs                  # DI, JWT, Swagger, CORS, pipeline
│   ├── appsettings.json
│   └── backend.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx       # Recharts analytics
│   │   │   ├── Customers.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Bills.jsx           # Printable invoices
│   │   ├── services/api.js         # Axios instance + JWT interceptor
│   │   ├── App.jsx                 # Routes
│   │   ├── main.jsx                # BrowserRouter entry
│   │   └── index.css               # Tailwind entry
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
└── backend.slnx                     # Solution descriptor
```

---

## Data Model

```text
Customer (1) ────< (N) Bill (1) ────< (N) BillItem >──── (N..1) Product
```

| Entity | Key fields |
| --- | --- |
| **Customer** | `Id`, `Name`, `Phone`, `Notes`, `Bills[]` |
| **Product** | `Id`, `Name`, `Type`, `Price`, `Stock`, `BillItems[]` |
| **Bill** | `Id`, `CustomerId?`, `Date`, `TotalAmount`, `Items[]` |
| **BillItem** | `Id`, `BillId`, `ProductId`, `Quantity`, `Price` *(price snapshotted at sale time)* |
| **ApplicationUser** | extends `IdentityUser` |

---

## API Reference

Base URL: `http://localhost:5097/api`

### Auth — `AccountController`
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/Account/register` | Public | Create a new user (`userName`, `email`, `password`) |
| `POST` | `/Account/login` | Public | Authenticate and receive a JWT (1‑hour expiry) |

### Customers — `CustomerController`
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/Customer` | JWT | List all customers |
| `GET` | `/Customer/{id}` | JWT | Get a customer by id |
| `POST` | `/Customer` | JWT | Create a customer |
| `PUT` | `/Customer/{id}` | JWT | Update a customer |
| `DELETE` | `/Customer/{id}` | JWT | Delete a customer |

### Products — `ProductController`
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/Product` | JWT | List all products |
| `POST` | `/Product` | Public | Add a product *(see Security Notes)* |
| `PUT` | `/Product/{id}` | JWT | Update a product |
| `PUT` | `/Product/add-stock/{id}` | JWT | Adjust stock for a product |
| `DELETE` | `/Product/{id}` | JWT | Delete a product |

### Bills — `BillController`
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/Bill` | JWT | Create a bill (validates + deducts stock, computes total) |
| `GET` | `/Bill/Bills` | JWT | List all bills (with customer + items + products) |
| `GET` | `/Bill/Bills/{id}` | JWT | Get a bill by id |
| `DELETE` | `/Bill/{id}` | JWT | Delete a bill and **restore stock** |

> Interactive documentation is available at **`/swagger`** when the API is running. The Swagger UI supports `Authorization: Bearer <token>` for testing protected endpoints.

---

## Getting Started

### Prerequisites
- **.NET SDK 10.0** or later
- **Node.js 18+** and **npm**
- **Microsoft SQL Server** (LocalDB, SQLEXPRESS, or full instance)
- (Optional) **Visual Studio 2022/2025** or **VS Code** with the C# Dev Kit

### 1. Clone
```bash
git clone https://github.com/ahmeedsaad53/accounting-mangment-systems.git
cd accounting-mangment-systems
```

### 2. Backend (ASP.NET Core API)
```bash
cd backend
dotnet restore
dotnet tool install --global dotnet-ef     # if not already installed
dotnet ef database update                  # applies migrations to SQL Server
dotnet run
```
The API will start on **`http://localhost:5097`** with Swagger UI at **`http://localhost:5097/swagger`**.

### 3. Frontend (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
The dev server prints a local URL (default Vite port). Open it in your browser and log in with the credentials you created via `/Account/register`.

---

## Configuration

### Database connection
The connection string is currently set inline in `backend/Program.cs`:

```csharp
options.UseSqlServer(
    "Server=localhost\\SQLEXPRESS;Database=Zadan;Trusted_Connection=True;TrustServerCertificate=True;"
);
```

For other environments, replace the string or move it to `appsettings.json` under `ConnectionStrings:DefaultConnection` and read it via `builder.Configuration.GetConnectionString(...)`.

### JWT
JWT issuer / audience / signing key are also configured in `Program.cs`. For production, **move the signing key to a secret store** (User Secrets, environment variables, Azure Key Vault, etc.) and rotate it.

### Frontend API base URL
Defined in `frontend/src/services/api.js`:

```js
const api = axios.create({ baseURL: "http://localhost:5097/api" });
```
Change it when deploying behind a different host or reverse proxy.

---

## Available Scripts

From `frontend/`:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

From `backend/`:

| Command | Purpose |
| --- | --- |
| `dotnet run` | Start the Web API |
| `dotnet ef migrations add <Name>` | Create a new migration |
| `dotnet ef database update` | Apply migrations to SQL Server |

---

## Security Notes

If you plan to deploy this project, harden the following items first:

1. **Move secrets out of source code.** The DB connection string and JWT signing key are currently hard‑coded in `Program.cs` — relocate them to environment variables or a secret manager.
2. **Tighten CORS.** The pipeline currently uses an `AllowAll` policy; restrict origins/methods/headers in production.
3. **Enable HTTPS redirection** (currently commented out in `Program.cs`).
4. **Protect `POST /api/Product`.** The other product endpoints require `[Authorize]`, but the create endpoint is currently public — add the attribute before going to production.
5. **Rotate the JWT signing key** and use a longer, environment‑specific secret.
6. **Validate input** more strictly with FluentValidation or data annotations where appropriate.

---

## Roadmap

Ideas that fit naturally on top of the current foundation:

- Role‑based authorisation (Admin / Cashier / Read‑only) — claims are already issued.
- Refresh tokens and token revocation.
- Pagination, search, and filtering on list endpoints.
- Soft delete + audit trail for bills and products.
- Multi‑currency and tax/VAT support on invoices.
- Export reports to PDF / Excel.
- Dockerfile + `docker-compose` for one‑command setup.
- Unit and integration tests (xUnit + WebApplicationFactory).

---

## License

No license file is currently included in the repository. Add a `LICENSE` (e.g. MIT) to clarify usage rights for contributors and consumers.
