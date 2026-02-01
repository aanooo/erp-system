# ERP System - React + Node.js + SQLite

A complete Enterprise Resource Planning system with React frontend, Node.js backend, and SQLite database.

✅ **Mac OS Compatible** | ✅ **Windows Compatible** | ✅ **Linux Compatible**

## Features

### 1. **Dashboard**
   - Real-time statistics (Products, Customers, Orders, Revenue)
   - Bar chart visualization
   - Recent orders display
   - Low stock alerts

### 2. **Product Management**
   - Add, Edit, Delete products
   - View all products with details
   - Track inventory levels
   - Associate products with suppliers

### 3. **Customer Management**
   - Add, Edit, Delete customers
   - Store customer contact information
   - Track customer addresses

### 4. **Order Management**
   - Create new orders
   - View all orders with customer details
   - View detailed order items
   - Automatic inventory reduction on order creation
   - Calculate order totals automatically

## Tech Stack

- **Frontend**: React 18, React Router, Recharts
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **API**: RESTful API

## Project Structure

```
erp-system/
├── backend/
│   ├── server.js           # Express server with all API routes
│   ├── package.json        # Backend dependencies
│   └── database.accdb      # MS Access database file
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js
│   │   │   └── Navigation.css
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Dashboard.css
│   │   │   ├── Products.js
│   │   │   ├── Products.css
│   │   │   ├── Customers.js
│   │   │   ├── Customers.css
│   │   │   ├── Orders.js
│   │   │   └── Orders.css
│   │   ├── services/
│   │   │   └── api.js          # API service layer
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)

That's it! SQLite is included as a dependency - no separate database installation needed!

## Database Setup

**Good news!** The database is automatically created when you first run the backend server. Sample data is included!

The SQLite database (`database.db`) will be automatically created in the `backend/` folder with:
- All required tables (Products, Customers, Suppliers, Orders, OrderDetails)
- Sample data (8 products, 5 customers, 3 suppliers)

## Installation & Running

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Open a new terminal and navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id/details` - Get order details
- `POST /api/orders` - Create new order

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/low-stock` - Get low stock products

## Usage Guide

### Adding a Product
1. Navigate to **Products** page
2. Click **+ Add Product** button
3. Fill in product details
4. Select a supplier
5. Click **Add Product**

### Creating an Order
1. Navigate to **Orders** page
2. Click **+ Create Order** button
3. Select customer and date
4. Add products to the order:
   - Select product from dropdown
   - Enter quantity
   - Click **Add Item**
5. Review order items and total
6. Click **Create Order**

### Viewing Dashboard
- Navigate to **Dashboard** to see:
  - Total products, customers, orders
  - Total revenue
  - Bar chart of system overview
  - Recent orders
  - Low stock alerts

## Troubleshooting

### Common Issues

**1. "Module not found: better-sqlite3"**
- Run `npm install` in the backend folder

**2. "CORS Error"**
- Make sure backend is running on port 5001
- Check CORS configuration in server.js

**3. Port already in use**
- Change port in `backend/server.js` or kill the process using port 5001
- On Mac: `lsof -ti:5001 | xargs kill`

**4. Database not creating**
- Check write permissions in the backend folder
- The database file will be created automatically on first run

## Future Enhancements

- User authentication and authorization
- Invoice generation (PDF)
- Advanced reporting and analytics
- Email notifications
- Payment tracking
- Supplier management module
- Employee/HR management
- Multi-currency support
- Export data to Excel/CSV

## License

This project is for educational and portfolio purposes.

## Author

Anandhi Raghuraman

---

**Note**: This system uses SQLite and works on Mac OS, Windows, and Linux. For production use with larger datasets, consider PostgreSQL or MySQL.
