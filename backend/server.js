const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;
#allow all urls
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204); // No Content for OPTIONS
  }
  next();
});

// Set CORS headers for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Initialize database tables
const initDB = () => {
  // Create Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Products (
      ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
      ProductName TEXT NOT NULL,
      Category TEXT,
      Price REAL NOT NULL,
      Quantity INTEGER NOT NULL,
      SupplierID INTEGER
    )
  `);

  // Create Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Customers (
      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerName TEXT NOT NULL,
      Email TEXT,
      Phone TEXT,
      Address TEXT
    )
  `);

  // Create Suppliers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Suppliers (
      SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
      SupplierName TEXT NOT NULL,
      ContactPerson TEXT,
      Email TEXT,
      Phone TEXT
    )
  `);

  // Create Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Orders (
      OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerID INTEGER NOT NULL,
      OrderDate TEXT NOT NULL,
      TotalAmount REAL NOT NULL,
      Status TEXT DEFAULT 'Pending'
    )
  `);

  // Create OrderDetails table
  db.exec(`
    CREATE TABLE IF NOT EXISTS OrderDetails (
      OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderID INTEGER NOT NULL,
      ProductID INTEGER NOT NULL,
      Quantity INTEGER NOT NULL,
      UnitPrice REAL NOT NULL
    )
  `);

  // Insert sample data if tables are empty
  const productsCount = db.prepare('SELECT COUNT(*) as count FROM Products').get();
  
  if (productsCount.count === 0) {
    // Insert Suppliers
    const insertSupplier = db.prepare(`
      INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone)
      VALUES (?, ?, ?, ?)
    `);
    
    insertSupplier.run('Tech Supplies Inc', 'John Smith', 'john@techsupplies.com', '555-0101');
    insertSupplier.run('Office Depot', 'Sarah Johnson', 'sarah@officedepot.com', '555-0102');
    insertSupplier.run('Electronics Hub', 'Mike Chen', 'mike@electronichub.com', '555-0103');

    // Insert Products
    const insertProduct = db.prepare(`
      INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertProduct.run('Laptop Dell XPS 15', 'Electronics', 1299.99, 15, 1);
    insertProduct.run('Wireless Mouse', 'Accessories', 29.99, 50, 2);
    insertProduct.run('Office Chair', 'Furniture', 249.99, 20, 2);
    insertProduct.run('Monitor 27 inch', 'Electronics', 399.99, 8, 3);
    insertProduct.run('Keyboard Mechanical', 'Accessories', 89.99, 30, 1);
    insertProduct.run('USB Cable', 'Accessories', 9.99, 100, 1);
    insertProduct.run('Desk Lamp', 'Furniture', 45.99, 25, 2);
    insertProduct.run('Printer HP LaserJet', 'Electronics', 299.99, 5, 3);

    // Insert Customers
    const insertCustomer = db.prepare(`
      INSERT INTO Customers (CustomerName, Email, Phone, Address)
      VALUES (?, ?, ?, ?)
    `);
    
    insertCustomer.run('ABC Corporation', 'contact@abc.com', '555-1001', '123 Business St, New York, NY 10001');
    insertCustomer.run('XYZ Ltd', 'info@xyz.com', '555-1002', '456 Commerce Ave, Los Angeles, CA 90001');
    insertCustomer.run('Tech Startup Inc', 'hello@techstartup.com', '555-1003', '789 Innovation Blvd, San Francisco, CA 94101');
    insertCustomer.run('Global Enterprises', 'sales@global.com', '555-1004', '321 Corporate Dr, Chicago, IL 60601');
    insertCustomer.run('SmartBiz Solutions', 'contact@smartbiz.com', '555-1005', '654 Market St, Boston, MA 02101');

    console.log('✅ Sample data inserted successfully!');
  }
};

// Initialize database
initDB();

// ======================= AUTHENTICATION APIs =======================

// Simple in-memory user storage (for demo - use database in production)
const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
  { id: 2, username: 'demo', password: 'demo123', name: 'Demo User' }
];

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name 
        },
        message: 'Login successful' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      password, // In production, hash this!
      name
    };
    
    users.push(newUser);
    
    res.json({ 
      success: true, 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        name: newUser.name 
      },
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ======================= PRODUCTS APIs =======================

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM Products').all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM Products WHERE ProductID = ?').get(id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
app.get('/api/products/search/:term', (req, res) => {
  try {
    const { term } = req.params;
    const query = `
      SELECT * FROM Products 
      WHERE ProductName LIKE ? OR Category LIKE ?
    `;
    const products = db.prepare(query).all(`%${term}%`, `%${term}%`);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  try {
    const { ProductName, Category, Price, Quantity, SupplierID } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(ProductName, Category, Price, Quantity, SupplierID);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { ProductName, Category, Price, Quantity, SupplierID } = req.body;
    
    const stmt = db.prepare(`
      UPDATE Products 
      SET ProductName = ?, Category = ?, Price = ?, Quantity = ?, SupplierID = ?
      WHERE ProductID = ?
    `);
    
    stmt.run(ProductName, Category, Price, Quantity, SupplierID, id);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM Products WHERE ProductID = ?');
    stmt.run(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ======================= CUSTOMERS APIs =======================

// Get all customers
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM Customers').all();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Add new customer
app.post('/api/customers', (req, res) => {
  try {
    const { CustomerName, Email, Phone, Address } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO Customers (CustomerName, Email, Phone, Address) 
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(CustomerName, Email, Phone, Address);
    res.status(201).json({ message: 'Customer added successfully' });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// Update customer
app.put('/api/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { CustomerName, Email, Phone, Address } = req.body;
    
    const stmt = db.prepare(`
      UPDATE Customers 
      SET CustomerName = ?, Email = ?, Phone = ?, Address = ?
      WHERE CustomerID = ?
    `);
    
    stmt.run(CustomerName, Email, Phone, Address, id);
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM Customers WHERE CustomerID = ?');
    stmt.run(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// ======================= SUPPLIERS APIs =======================

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM Suppliers').all();
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Add new supplier
app.post('/api/suppliers', (req, res) => {
  try {
    const { SupplierName, ContactPerson, Email, Phone } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) 
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(SupplierName, ContactPerson, Email, Phone);
    res.status(201).json({ message: 'Supplier added successfully' });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({ error: 'Failed to add supplier' });
  }
});

// Update supplier
app.put('/api/suppliers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { SupplierName, ContactPerson, Email, Phone } = req.body;
    
    const stmt = db.prepare(`
      UPDATE Suppliers 
      SET SupplierName = ?, ContactPerson = ?, Email = ?, Phone = ?
      WHERE SupplierID = ?
    `);
    
    stmt.run(SupplierName, ContactPerson, Email, Phone, id);
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
app.delete('/api/suppliers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM Suppliers WHERE SupplierID = ?');
    stmt.run(id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// ======================= ORDERS APIs =======================

// Get all orders with customer details
app.get('/api/orders', (req, res) => {
  try {
    const query = `
      SELECT Orders.*, Customers.CustomerName 
      FROM Orders 
      INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID 
      ORDER BY Orders.OrderDate DESC
    `;
    const orders = db.prepare(query).all();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
app.get('/api/orders/:id/details', (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT OrderDetails.*, Products.ProductName, Products.Price 
      FROM OrderDetails 
      INNER JOIN Products ON OrderDetails.ProductID = Products.ProductID 
      WHERE OrderDetails.OrderID = ?
    `;
    const details = db.prepare(query).all(id);
    res.json(details);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Create new order
app.post('/api/orders', (req, res) => {
  try {
    const { CustomerID, OrderDate, TotalAmount, items } = req.body;
    
    // Start transaction
    const insertOrder = db.prepare(`
      INSERT INTO Orders (CustomerID, OrderDate, TotalAmount, Status) 
      VALUES (?, ?, ?, 'Pending')
    `);
    
    const result = insertOrder.run(CustomerID, OrderDate, TotalAmount);
    const orderID = result.lastInsertRowid;
    
    // Insert order details and update product quantities
    const insertDetail = db.prepare(`
      INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) 
      VALUES (?, ?, ?, ?)
    `);
    
    const updateQty = db.prepare(`
      UPDATE Products 
      SET Quantity = Quantity - ? 
      WHERE ProductID = ?
    `);
    
    items.forEach(item => {
      insertDetail.run(orderID, item.ProductID, item.Quantity, item.UnitPrice);
      updateQty.run(item.Quantity, item.ProductID);
    });
    
    res.status(201).json({ message: 'Order created successfully', orderID });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ======================= DASHBOARD APIs =======================

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as total FROM Products').get();
    const totalCustomers = db.prepare('SELECT COUNT(*) as total FROM Customers').get();
    const totalOrders = db.prepare('SELECT COUNT(*) as total FROM Orders').get();
    const totalRevenue = db.prepare('SELECT SUM(TotalAmount) as total FROM Orders').get();
    const lowStock = db.prepare('SELECT COUNT(*) as total FROM Products WHERE Quantity < 10').get();
    
    res.json({
      totalProducts: totalProducts.total,
      totalCustomers: totalCustomers.total,
      totalOrders: totalOrders.total,
      totalRevenue: totalRevenue.total || 0,
      lowStockItems: lowStock.total
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent orders for dashboard
app.get('/api/dashboard/recent-orders', (req, res) => {
  try {
    const query = `
      SELECT Orders.OrderID, Orders.OrderDate, Orders.TotalAmount, 
             Customers.CustomerName, Orders.Status 
      FROM Orders 
      INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID 
      ORDER BY Orders.OrderDate DESC
      LIMIT 5
    `;
    const orders = db.prepare(query).all();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// Get low stock products
app.get('/api/dashboard/low-stock', (req, res) => {
  try {
    const query = 'SELECT * FROM Products WHERE Quantity < 10 ORDER BY Quantity ASC';
    const products = db.prepare(query).all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// ======================= ANALYTICS & REPORTS APIs =======================

// Get sales by category
app.get('/api/analytics/sales-by-category', (req, res) => {
  try {
    const query = `
      SELECT 
        p.Category,
        SUM(od.Quantity * od.UnitPrice) as TotalSales,
        SUM(od.Quantity) as TotalQuantity
      FROM OrderDetails od
      INNER JOIN Products p ON od.ProductID = p.ProductID
      GROUP BY p.Category
      ORDER BY TotalSales DESC
    `;
    const data = db.prepare(query).all();
    res.json(data);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get top selling products
app.get('/api/analytics/top-products', (req, res) => {
  try {
    const query = `
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Category,
        SUM(od.Quantity) as TotalSold,
        SUM(od.Quantity * od.UnitPrice) as Revenue
      FROM OrderDetails od
      INNER JOIN Products p ON od.ProductID = p.ProductID
      GROUP BY p.ProductID, p.ProductName, p.Category
      ORDER BY TotalSold DESC
      LIMIT 5
    `;
    const products = db.prepare(query).all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Get monthly sales data
app.get('/api/analytics/monthly-sales', (req, res) => {
  try {
    const query = `
      SELECT 
        strftime('%Y-%m', OrderDate) as Month,
        COUNT(*) as OrderCount,
        SUM(TotalAmount) as Revenue
      FROM Orders
      GROUP BY strftime('%Y-%m', OrderDate)
      ORDER BY Month DESC
      LIMIT 6
    `;
    const data = db.prepare(query).all();
    res.json(data.reverse());
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ error: 'Failed to fetch monthly sales' });
  }
});

// Get customer purchase history
app.get('/api/analytics/customer-stats', (req, res) => {
  try {
    const query = `
      SELECT 
        c.CustomerID,
        c.CustomerName,
        COUNT(o.OrderID) as TotalOrders,
        SUM(o.TotalAmount) as TotalSpent,
        MAX(o.OrderDate) as LastOrder
      FROM Customers c
      LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
      GROUP BY c.CustomerID, c.CustomerName
      ORDER BY TotalSpent DESC
    `;
    const customers = db.prepare(query).all();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📁 Database path: ${dbPath}`);
  console.log(`🚀 ERP System ready!`);
});
