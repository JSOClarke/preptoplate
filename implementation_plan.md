# Simmer Eats Clone - Implementation Plan

## Goal Description

Create a meal prepping web application clone of "Simmer Eats". The system will allow users to browse a rotating weekly menu, subscribe to a meal plan, select their meals, and manage their orders. The project will use a Monorepo structure with **React (TypeScript)** for the frontend and **Go** for the backend, using **PostgreSQL** as the database.

## User Review Required

IMPORTANT

**Scope Confirmation**: Please review the proposed feature set below. I have included a basic Admin Panel for managing the menu, which is essential for a "rotating menu" system. **Payment Integration**: I will mock the payment process for this MVP. **Authentication**: I will use a custom JWT-based authentication implementation.

## Proposed Architecture

**Layered Backend (Go)**:

- **Routes**: HTTP handlers (using **Gin** as requested).
- **Services**: Business logic layer.
- **Repo**: Data access layer (using `pgx` or `sqlx` - proposing **pgx** for performance and modern features).

**Frontend (React)**:

- **Vite**: Build tool.
- **TailwindCSS**: Styling (as per standard web app guidelines).
- **React Router**: Navigation.
- **Zustand** or **Context API**: State management.

## Proposed Changes

### Database Schema (PostgreSQL)

- **Users**: 
    - `id` - primary key
    - `email`, - varchar(100)
    - `password_hash`, varchar(100)
    - `role` (user/admin) - varchar(100) or possibly a enum for this?
    - , `created_at` - DATE
- **Meals**: `id`, `name`, `description`, `image_url`, `calories`, `protein`, `carbs`, `fat`, `price`.
- **WeeklyMenus**: `id`, `week_start_date`, `is_active`.
- **MenuMeals**: `menu_id`, `meal_id` (Many-to-Many).
- **Subscriptions**: `id`, `user_id`, `plan_type` (e.g., 5 meals/week), `status` (active/paused).
- **Orders**: `id`, `user_id`, `week_id`, `status`, `delivery_date`.
- **OrderItems**: `order_id`, `meal_id`, `quantity`.

### Backend (Go)

#### [NEW] `backend/`

- `cmd/server/main.go`: Entry point.
- `internal/config/`: Configuration loading.
- `internal/database/`: DB connection.
- `internal/models/`: Struct definitions.
- `internal/repository/`: Interfaces and implementations for DB access.
- `internal/service/`: Business logic.
- `internal/api/handlers/`: HTTP handlers.
- `internal/api/middleware/`: Auth and logging middleware.
- `internal/api/routes.go`: Router setup.

Seeders to be created for the so that there is some data already in the db to be generated.

### Frontend (React)

#### [NEW] `frontend/`

- `src/components/`: Reusable UI components (Button, Card, Navbar, Footer).
- `src/pages/`:
    - `Home`: Hero section, How it works.
    - `Menu`: Display current week's meals.
    - `Login/Register`: Auth forms.
    - `Dashboard`: User subscription and order management.
    - `Admin`: (Protected) Manage meals and menus.
- `src/services/`: API client.
- `src/context/`: Auth context.

## Verification Plan

### Automated Tests

- **Backend**: Unit tests for Service layer using mocks. Integration tests for Repository layer (if feasible with a test DB, otherwise skipped for MVP).
- **Frontend**: Basic component rendering tests using Vitest (optional for MVP, focusing on manual).

### Manual Verification

1. **Setup**: Run `docker-compose up` (or local DB) and start Backend & Frontend.
2. **Auth Flow**: Register a new user, Login, Verify JWT token storage.
3. **Admin Flow**: Login as admin, Create a Meal, Create a Weekly Menu, Add Meals to Menu.
4. **User Flow**:
    - Browse Menu (verify correct week is shown).
    - Subscribe (mock payment).
    - Select Meals for the order.