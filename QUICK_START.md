# QUICK START GUIDE - ERP System

## 5-Minute Setup

### Step 1: Install Prerequisites (One-time)
```bash
# Install Node.js from https://nodejs.org/ (if not already installed)
# That's it! SQLite is included with the project.
```

### Step 2: Database Setup
**Nothing to do!** The SQLite database is created automatically with sample data when you first run the backend. 🎉

### Step 3: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Should see: "Server is running on http://localhost:5001"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Browser will open automatically at http://localhost:3000

## Test the Application

1. **Dashboard**: View statistics and charts
2. **Products**: Add a new product (e.g., "Webcam HD", Electronics, $79.99, 20 units)
3. **Customers**: Add a new customer
4. **Orders**: Create a test order

## Key Features to Showcase

### 1. Product Management ✅
- Full CRUD operations
- Real-time inventory tracking
- Low stock alerts

### 2. Customer Management ✅
- Customer database
- Contact information
- Easy search and edit

### 3. Order Processing ✅
- Multi-item orders
- Automatic total calculation
- Inventory deduction
- Order history

### 4. Dashboard Analytics ✅
- Real-time statistics
- Visual charts
- Recent activity
- Stock alerts

## Resume Highlights

**Technologies Used:**
- Frontend: React, React Router, Recharts
- Backend: Node.js, Express
- Database: SQLite
- API: RESTful architecture

**Key Achievements:**
- Built full-stack ERP system with 4 core modules
- Implemented CRUD operations for all entities
- Created real-time dashboard with data visualization
- Designed responsive UI with modern CSS
- Integrated Access database with Node.js backend
- Implemented order management with inventory tracking

## Common Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start

# Install new package (backend)
cd backend && npm install package-name

# Install new package (frontend)
cd frontend && npm install package-name

# Build for production
cd frontend && npm run build
```

## Troubleshooting

**Problem**: Port 5000 already in use
**Solution**: Change PORT in `backend/server.js` to 5001

**Problem**: Can't connect to database
**Solution**: Database is auto-created. If issues persist, delete database.db and restart server

**Problem**: CORS error
**Solution**: Check backend is running on port 5001

## Next Steps for Enhancement

1. Add user authentication
2. Generate PDF invoices
3. Add supplier management features
4. Create detailed reports
5. Add search and filter functionality
6. Implement pagination for large datasets

---

**Ready to impress recruiters!** 🚀

This project demonstrates:
✅ Full-stack development
✅ Database design
✅ API development
✅ State management
✅ UI/UX design
✅ Problem-solving skills
