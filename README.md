# PrepToPlate

<p align="center">
  <img src="frontend/public/logo.png" alt="PrepToPlate Logo" width="200"/>
</p>

<p align="center">
  <strong>A modern meal prep delivery platform with weekly rotating menus and seamless order management.</strong>
</p>

## Overview

PrepToPlate is a full-stack web application that allows customers to browse weekly meal menus, select their preferred meals, and place orders for meal prep delivery. The platform features an intuitive user interface, robust admin dashboard for menu and stock management, and automated email receipts upon order placement.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **TailwindCSS 4** for styling
- **Vite** for build tooling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Go 1.25** with Gin web framework
- **PostgreSQL** with pgx driver
- **JWT** authentication
- **Swagger/OpenAPI** documentation
- **CORS** middleware

### Infrastructure & Deployment
- **Docker** containerization
- **Render** for backend and database hosting
- **Netlify** for frontend hosting
- **GitHub** for version control

### Third-Party Integrations
- **Cloudinary** for image storage and management
- **Resend** for transactional email delivery

## Features

### Customer Features
- Browse active weekly menu with meal details
- Select exactly 10 meals per order
- View meal images and descriptions
- Secure authentication (register/login)
- Shopping cart management
- Order checkout with delivery date selection
- Automated email receipts

### Admin Features
- Create and manage meals with image uploads
- Create and manage weekly menus
- Add meals to weekly menus with stock quantities
- Activate/deactivate menus
- View all orders
- Stock tracking and management

### Technical Features
- RESTful API architecture
- Comprehensive API documentation via Swagger
- JWT-based authentication
- Role-based access control (User/Admin)
- Responsive design for all screen sizes
- Real-time stock validation during checkout
- Asynchronous email delivery
- CORS configuration for secure cross-origin requests

## Getting Started

### Prerequisites
- **Go** 1.25 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **Docker** (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Create a `.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/preptoplate
   PORT=8080
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   EMAIL_API_KEY=your-resend-api-key
   EMAIL_FROM_ADDRESS=onboarding@resend.dev
   ```

4. Apply database schema:
   ```bash
   psql -h localhost -U user -d preptoplate -f schema.sql
   ```

5. Run the server:
   ```bash
   go run cmd/server/main.go
   ```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   VITE_API_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Using Docker

Run both frontend and backend with Docker Compose:

```bash
docker-compose up
```

## API Documentation

The API is fully documented using Swagger/OpenAPI. Once the backend is running, access the interactive documentation at:

```
http://localhost:8080/swagger/index.html
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Meals
- `GET /api/meals` - List all meals
- `GET /api/meals/:id` - Get meal by ID
- `POST /api/meals` - Create meal (Admin only)
- `PUT /api/meals/:id` - Update meal (Admin only)
- `DELETE /api/meals/:id` - Delete meal (Admin only)

#### Menu
- `GET /api/menu` - Get active weekly menu

#### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `DELETE /api/cart` - Clear cart

#### Orders
- `POST /api/orders/checkout` - Checkout and place order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

#### Admin - Weekly Menus
- `POST /api/admin/weekly-menus` - Create weekly menu
- `GET /api/admin/weekly-menus` - List all menus
- `PUT /api/admin/weekly-menus/:id` - Update menu
- `PUT /api/admin/weekly-menus/:id/activate` - Activate menu

## Project Structure

```
preptoplate/
├── backend/
│   ├── cmd/
│   │   ├── seed/          # Database seeding scripts
│   │   └── server/        # Main application entry point
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers/  # HTTP request handlers
│   │   │   └── routes.go  # Route definitions
│   │   ├── config/        # Configuration management
│   │   ├── middleware/    # Authentication & authorization
│   │   ├── models/        # Data models
│   │   ├── repository/    # Database access layer
│   │   └── service/       # Business logic layer
│   ├── docs/              # Swagger documentation
│   ├── schema.sql         # Database schema
│   └── go.mod
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── netlify.toml          # Netlify deployment config
└── render.yaml           # Render deployment config
```

## Deployment

### Backend (Render)

The backend is configured for automatic deployment to Render via Blueprint:

1. Connect your GitHub repository to Render
2. Ensure the service is configured to deploy from the `main` branch
3. Set environment variables in the Render dashboard
4. Deploy will trigger automatically on push to `main`

Live backend: `https://preptoplate-backend.onrender.com`

### Frontend (Netlify)

The frontend is configured for automatic deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Ensure the site is configured to deploy from the `main` branch
3. Build settings are configured in `netlify.toml`
4. Deploy will trigger automatically on push to `main`

Live site: `https://preptoplate.netlify.app`

## Git Workflow

This project uses a branching strategy:

- **`main`** - Production branch (auto-deploys to Render & Netlify)
- **`dev`** - Development branch (for local work)

To deploy changes:
```bash
git checkout dev
# Make changes and commit
git checkout main
git merge dev
git push origin main
```

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.