const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== CORS - MUST BE FIRST =====
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Initialize database
const initDB = () => {
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS Customers (
      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerName TEXT NOT NULL,
      Email TEXT,
      Phone TEXT,
      Address TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Suppliers (
      SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
      SupplierName TEXT NOT NULL,
      ContactPerson TEXT,
      Email TEXT,
      Phone TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Orders (
      OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerID INTEGER NOT NULL,
      OrderDate TEXT NOT NULL,
      TotalAmount REAL NOT NULL,
      Status TEXT DEFAULT 'Pending'
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS OrderDetails (
      OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderID INTEGER NOT NULL,
      ProductID INTEGER NOT NULL,
      Quantity INTEGER NOT NULL,
      UnitPrice REAL NOT NULL
    )
  `);

  const productsCount = db.prepare('SELECT COUNT(*) as count FROM Products').get();
  
  if (productsCount.count === 0) {
    const insertSupplier = db.prepare('INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) VALUES (?, ?, ?, ?)');
    insertSupplier.run('Tech Supplies Inc', 'John Smith', 'john@techsupplies.com', '555-0101');
    insertSupplier.run('Office Depot', 'Sarah Johnson', 'sarah@officedepot.com', '555-0102');
    insertSupplier.run('Electronics Hub', 'Mike Chen', 'mike@electronichub.com', '555-0103');

    const insertProduct = db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)');
    insertProduct.run('Laptop Dell XPS 15', 'Electronics', 1299.99, 15, 1);
    insertProduct.run('Wireless Mouse', 'Accessories', 29.99, 50, 2);
    insertProduct.run('Office Chair', 'Furniture', 249.99, 20, 2);
    insertProduct.run('Monitor 27 inch', 'Electronics', 399.99, 8, 3);
    insertProduct.run('Keyboard Mechanical', 'Accessories', 89.99, 30, 1);
    insertProduct.run('USB Cable', 'Accessories', 9.99, 100, 1);
    insertProduct.run('Desk Lamp', 'Furniture', 45.99, 25, 2);
    insertProduct.run('Printer HP LaserJet', 'Electronics', 299.99, 5, 3);

    const insertCustomer = db.prepare('INSERT INTO Customers (CustomerName, Email, Phone, Address) VALUES (?, ?, ?, ?)');
    insertCustomer.run('ABC Corporation', 'contact@abc.com', '555-1001', '123 Business St, New York, NY 10001');
    insertCustomer.run('XYZ Ltd', 'info@xyz.com', '555-1002', '456 Commerce Ave, Los Angeles, CA 90001');
    insertCustomer.run('Tech Startup Inc', 'hello@techstartup.com', '555-1003', '789 Innovation Blvd, San Francisco, CA 94101');
    insertCustomer.run('Global Enterprises', 'sales@global.com', '555-1004', '321 Corporate Dr, Chicago, IL 60601');
    insertCustomer.run('SmartBiz Solutions', 'contact@smartbiz.com', '555-1005', '654 Market St, Boston, MA 02101');

    console.log('✅ Sample data inserted!');
  }
};

initDB();

// Users
const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
  { id: 2, username: 'demo', password: 'demo123', name: 'Demo User' }
];

// AUTH
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, name: user.name } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  const exists = users.find(u => u.username === username);
  
  if (exists) {
    return res.status(400).json({ success: false, message: 'Username exists' });
  }
  
  const newUser = { id: users.length + 1, username, password, name };
  users.push(newUser);
  res.json({ success: true, user: { id: newUser.id, username: newUser.username, name: newUser.name } });
});

// PRODUCTS
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM Products').all();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM Products WHERE ProductID = ?').get(req.params.id);
  res.json(product || {});
});

app.get('/api/products/search/:term', (req, res) => {
  const products = db.prepare('SELECT * FROM Products WHERE ProductName LIKE ? OR Category LIKE ?').all(`%${req.params.term}%`, `%${req.params.term}%`);
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { ProductName, Category, Price, Quantity, SupplierID } = req.body;
  db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run(ProductName, Category, Price, Quantity, SupplierID);
  res.status(201).json({ message: 'Product added' });
});

app.put('/api/products/:id', (req, res) => {
  const { ProductName, Category, Price, Quantity, SupplierID } = req.body;
  db.prepare('UPDATE Products SET ProductName = ?, Category = ?, Price = ?, Quantity = ?, SupplierID = ? WHERE ProductID = ?').run(ProductName, Category, Price, Quantity, SupplierID, req.params.id);
  res.json({ message: 'Product updated' });
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM Products WHERE ProductID = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

// CUSTOMERS
app.get('/api/customers', (req, res) => {
  const customers = db.prepare('SELECT * FROM Customers').all();
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const { CustomerName, Email, Phone, Address } = req.body;
  db.prepare('INSERT INTO Customers (CustomerName, Email, Phone, Address) VALUES (?, ?, ?, ?)').run(CustomerName, Email, Phone, Address);
  res.status(201).json({ message: 'Customer added' });
});

app.put('/api/customers/:id', (req, res) => {
  const { CustomerName, Email, Phone, Address } = req.body;
  db.prepare('UPDATE Customers SET CustomerName = ?, Email = ?, Phone = ?, Address = ? WHERE CustomerID = ?').run(CustomerName, Email, Phone, Address, req.params.id);
  res.json({ message: 'Customer updated' });
});

app.delete('/api/customers/:id', (req, res) => {
  db.prepare('DELETE FROM Customers WHERE CustomerID = ?').run(req.params.id);
  res.json({ message: 'Customer deleted' });
});

// SUPPLIERS
app.get('/api/suppliers', (req, res) => {
  const suppliers = db.prepare('SELECT * FROM Suppliers').all();
  res.json(suppliers);
});

app.post('/api/suppliers', (req, res) => {
  const { SupplierName, ContactPerson, Email, Phone } = req.body;
  db.prepare('INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) VALUES (?, ?, ?, ?)').run(SupplierName, ContactPerson, Email, Phone);
  res.status(201).json({ message: 'Supplier added' });
});

app.put('/api/suppliers/:id', (req, res) => {
  const { SupplierName, ContactPerson, Email, Phone } = req.body;
  db.prepare('UPDATE Suppliers SET SupplierName = ?, ContactPerson = ?, Email = ?, Phone = ? WHERE SupplierID = ?').run(SupplierName, ContactPerson, Email, Phone, req.params.id);
  res.json({ message: 'Supplier updated' });
});

app.delete('/api/suppliers/:id', (req, res) => {
  db.prepare('DELETE FROM Suppliers WHERE SupplierID = ?').run(req.params.id);
  res.json({ message: 'Supplier deleted' });
});

// ORDERS
app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT Orders.*, Customers.CustomerName FROM Orders INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID ORDER BY Orders.OrderDate DESC').all();
  res.json(orders);
});

app.get('/api/orders/:id/details', (req, res) => {
  const details = db.prepare('SELECT OrderDetails.*, Products.ProductName, Products.Price FROM OrderDetails INNER JOIN Products ON OrderDetails.ProductID = Products.ProductID WHERE OrderDetails.OrderID = ?').all(req.params.id);
  res.json(details);
});

app.post('/api/orders', (req, res) => {
  const { CustomerID, OrderDate, TotalAmount, items } = req.body;
  const result = db.prepare('INSERT INTO Orders (CustomerID, OrderDate, TotalAmount, Status) VALUES (?, ?, ?, ?)').run(CustomerID, OrderDate, TotalAmount, 'Pending');
  const orderID = result.lastInsertRowid;
  
  items.forEach(item => {
    db.prepare('INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) VALUES (?, ?, ?, ?)').run(orderID, item.ProductID, item.Quantity, item.UnitPrice);
    db.prepare('UPDATE Products SET Quantity = Quantity - ? WHERE ProductID = ?').run(item.Quantity, item.ProductID);
  });
  
  res.status(201).json({ message: 'Order created', orderID });
});

// DASHBOARD
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalProducts: db.prepare('SELECT COUNT(*) as total FROM Products').get().total,
    totalCustomers: db.prepare('SELECT COUNT(*) as total FROM Customers').get().total,
    totalOrders: db.prepare('SELECT COUNT(*) as total FROM Orders').get().total,
    totalRevenue: db.prepare('SELECT SUM(TotalAmount) as total FROM Orders').get().total || 0,
    lowStockItems: db.prepare('SELECT COUNT(*) as total FROM Products WHERE Quantity < 10').get().total
  };
  res.json(stats);
});

app.get('/api/dashboard/recent-orders', (req, res) => {
  const orders = db.prepare('SELECT Orders.OrderID, Orders.OrderDate, Orders.TotalAmount, Customers.CustomerName, Orders.Status FROM Orders INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID ORDER BY Orders.OrderDate DESC LIMIT 5').all();
  res.json(orders);
});

app.get('/api/dashboard/low-stock', (req, res) => {
  const products = db.prepare('SELECT * FROM Products WHERE Quantity < 10 ORDER BY Quantity ASC').all();
  res.json(products);
});

// ANALYTICS
app.get('/api/analytics/sales-by-category', (req, res) => {
  const data = db.prepare('SELECT p.Category, SUM(od.Quantity * od.UnitPrice) as TotalSales, SUM(od.Quantity) as TotalQuantity FROM OrderDetails od INNER JOIN Products p ON od.ProductID = p.ProductID GROUP BY p.Category ORDER BY TotalSales DESC').all();
  res.json(data);
});

app.get('/api/analytics/top-products', (req, res) => {
  const products = db.prepare('SELECT p.ProductID, p.ProductName, p.Category, SUM(od.Quantity) as TotalSold, SUM(od.Quantity * od.UnitPrice) as Revenue FROM OrderDetails od INNER JOIN Products p ON od.ProductID = p.ProductID GROUP BY p.ProductID ORDER BY TotalSold DESC LIMIT 5').all();
  res.json(products);
});

app.get('/api/analytics/monthly-sales', (req, res) => {
  const data = db.prepare("SELECT strftime('%Y-%m', OrderDate) as Month, COUNT(*) as OrderCount, SUM(TotalAmount) as Revenue FROM Orders GROUP BY Month ORDER BY Month DESC LIMIT 6").all();
  res.json(data.reverse());
});

app.get('/api/analytics/customer-stats', (req, res) => {
  const customers = db.prepare('SELECT c.CustomerID, c.CustomerName, COUNT(o.OrderID) as TotalOrders, SUM(o.TotalAmount) as TotalSpent, MAX(o.OrderDate) as LastOrder FROM Customers c LEFT JOIN Orders o ON c.CustomerID = o.CustomerID GROUP BY c.CustomerID ORDER BY TotalSpent DESC').all();
  res.json(customers);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
