const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - ABSOLUTELY FIRST
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

const initDB = () => {
  db.exec(`CREATE TABLE IF NOT EXISTS Products (ProductID INTEGER PRIMARY KEY AUTOINCREMENT, ProductName TEXT NOT NULL, Category TEXT, Price REAL NOT NULL, Quantity INTEGER NOT NULL, SupplierID INTEGER)`);
  db.exec(`CREATE TABLE IF NOT EXISTS Customers (CustomerID INTEGER PRIMARY KEY AUTOINCREMENT, CustomerName TEXT NOT NULL, Email TEXT, Phone TEXT, Address TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS Suppliers (SupplierID INTEGER PRIMARY KEY AUTOINCREMENT, SupplierName TEXT NOT NULL, ContactPerson TEXT, Email TEXT, Phone TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS Orders (OrderID INTEGER PRIMARY KEY AUTOINCREMENT, CustomerID INTEGER NOT NULL, OrderDate TEXT NOT NULL, TotalAmount REAL NOT NULL, Status TEXT DEFAULT 'Pending')`);
  db.exec(`CREATE TABLE IF NOT EXISTS OrderDetails (OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT, OrderID INTEGER NOT NULL, ProductID INTEGER NOT NULL, Quantity INTEGER NOT NULL, UnitPrice REAL NOT NULL)`);

  const count = db.prepare('SELECT COUNT(*) as count FROM Products').get();
  if (count.count === 0) {
    db.prepare('INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) VALUES (?, ?, ?, ?)').run('Tech Supplies Inc', 'John Smith', 'john@tech.com', '555-0101');
    db.prepare('INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) VALUES (?, ?, ?, ?)').run('Office Depot', 'Sarah Johnson', 'sarah@office.com', '555-0102');
    db.prepare('INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) VALUES (?, ?, ?, ?)').run('Electronics Hub', 'Mike Chen', 'mike@electronics.com', '555-0103');
    
    db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run('Laptop Dell XPS 15', 'Electronics', 1299.99, 15, 1);
    db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run('Wireless Mouse', 'Accessories', 29.99, 50, 2);
    db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run('Office Chair', 'Furniture', 249.99, 20, 2);
    db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run('Monitor 27"', 'Electronics', 399.99, 8, 3);
    db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run('Keyboard', 'Accessories', 89.99, 30, 1);
    
    db.prepare('INSERT INTO Customers (CustomerName, Email, Phone, Address) VALUES (?, ?, ?, ?)').run('ABC Corp', 'abc@corp.com', '555-1001', '123 Business St');
    db.prepare('INSERT INTO Customers (CustomerName, Email, Phone, Address) VALUES (?, ?, ?, ?)').run('XYZ Ltd', 'xyz@ltd.com', '555-1002', '456 Commerce Ave');
    db.prepare('INSERT INTO Customers (CustomerName, Email, Phone, Address) VALUES (?, ?, ?, ?)').run('Tech Startup', 'tech@startup.com', '555-1003', '789 Innovation Blvd');
    
    console.log('✅ Sample data loaded');
  }
};

initDB();

const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
  { id: 2, username: 'demo', password: 'demo123', name: 'Demo User' }
];

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  user ? res.json({ success: true, user: { id: user.id, username: user.username, name: user.name } }) : res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  if (users.find(u => u.username === username)) return res.status(400).json({ success: false, message: 'Username exists' });
  const newUser = { id: users.length + 1, username, password, name };
  users.push(newUser);
  res.json({ success: true, user: { id: newUser.id, username: newUser.username, name: newUser.name } });
});

app.get('/api/products', (req, res) => res.json(db.prepare('SELECT * FROM Products').all()));
app.get('/api/products/:id', (req, res) => res.json(db.prepare('SELECT * FROM Products WHERE ProductID = ?').get(req.params.id)));
app.get('/api/products/search/:term', (req, res) => res.json(db.prepare('SELECT * FROM Products WHERE ProductName LIKE ? OR Category LIKE ?').all(`%${req.params.term}%`, `%${req.params.term}%`)));
app.post('/api/products', (req, res) => { db.prepare('INSERT INTO Products (ProductName, Category, Price, Quantity, SupplierID) VALUES (?, ?, ?, ?, ?)').run(req.body.ProductName, req.body.Category, req.body.Price, req.body.Quantity, req.body.SupplierID); res.status(201).json({ message: 'Added' }); });
app.put('/api/products/:id', (req, res) => { db.prepare('UPDATE Products SET ProductName=?, Category=?, Price=?, Quantity=?, SupplierID=? WHERE ProductID=?').run(req.body.ProductName, req.body.Category, req.body.Price, req.body.Quantity, req.body.SupplierID, req.params.id); res.json({ message: 'Updated' }); });
app.delete('/api/products/:id', (req, res) => { db.prepare('DELETE FROM Products WHERE ProductID=?').run(req.params.id); res.json({ message: 'Deleted' }); });

app.get('/api/customers', (req, res) => res.json(db.prepare('SELECT * FROM Customers').all()));
app.post('/api/customers', (req, res) => { db.prepare('INSERT INTO Customers (CustomerName, Email, Phone, Address) VALUES (?, ?, ?, ?)').run(req.body.CustomerName, req.body.Email, req.body.Phone, req.body.Address); res.status(201).json({ message: 'Added' }); });
app.put('/api/customers/:id', (req, res) => { db.prepare('UPDATE Customers SET CustomerName=?, Email=?, Phone=?, Address=? WHERE CustomerID=?').run(req.body.CustomerName, req.body.Email, req.body.Phone, req.body.Address, req.params.id); res.json({ message: 'Updated' }); });
app.delete('/api/customers/:id', (req, res) => { db.prepare('DELETE FROM Customers WHERE CustomerID=?').run(req.params.id); res.json({ message: 'Deleted' }); });

app.get('/api/suppliers', (req, res) => res.json(db.prepare('SELECT * FROM Suppliers').all()));
app.post('/api/suppliers', (req, res) => { db.prepare('INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone) VALUES (?, ?, ?, ?)').run(req.body.SupplierName, req.body.ContactPerson, req.body.Email, req.body.Phone); res.status(201).json({ message: 'Added' }); });
app.put('/api/suppliers/:id', (req, res) => { db.prepare('UPDATE Suppliers SET SupplierName=?, ContactPerson=?, Email=?, Phone=? WHERE SupplierID=?').run(req.body.SupplierName, req.body.ContactPerson, req.body.Email, req.body.Phone, req.params.id); res.json({ message: 'Updated' }); });
app.delete('/api/suppliers/:id', (req, res) => { db.prepare('DELETE FROM Suppliers WHERE SupplierID=?').run(req.params.id); res.json({ message: 'Deleted' }); });

app.get('/api/orders', (req, res) => res.json(db.prepare('SELECT Orders.*, Customers.CustomerName FROM Orders INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID ORDER BY Orders.OrderDate DESC').all()));
app.get('/api/orders/:id/details', (req, res) => res.json(db.prepare('SELECT OrderDetails.*, Products.ProductName, Products.Price FROM OrderDetails INNER JOIN Products ON OrderDetails.ProductID = Products.ProductID WHERE OrderDetails.OrderID = ?').all(req.params.id)));
app.post('/api/orders', (req, res) => {
  const { CustomerID, OrderDate, TotalAmount, items } = req.body;
  const result = db.prepare('INSERT INTO Orders (CustomerID, OrderDate, TotalAmount, Status) VALUES (?, ?, ?, ?)').run(CustomerID, OrderDate, TotalAmount, 'Pending');
  items.forEach(item => {
    db.prepare('INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) VALUES (?, ?, ?, ?)').run(result.lastInsertRowid, item.ProductID, item.Quantity, item.UnitPrice);
    db.prepare('UPDATE Products SET Quantity = Quantity - ? WHERE ProductID = ?').run(item.Quantity, item.ProductID);
  });
  res.status(201).json({ message: 'Order created', orderID: result.lastInsertRowid });
});

app.get('/api/dashboard/stats', (req, res) => res.json({
  totalProducts: db.prepare('SELECT COUNT(*) as total FROM Products').get().total,
  totalCustomers: db.prepare('SELECT COUNT(*) as total FROM Customers').get().total,
  totalOrders: db.prepare('SELECT COUNT(*) as total FROM Orders').get().total,
  totalRevenue: db.prepare('SELECT SUM(TotalAmount) as total FROM Orders').get().total || 0,
  lowStockItems: db.prepare('SELECT COUNT(*) as total FROM Products WHERE Quantity < 10').get().total
}));

app.get('/api/dashboard/recent-orders', (req, res) => res.json(db.prepare('SELECT Orders.OrderID, Orders.OrderDate, Orders.TotalAmount, Customers.CustomerName, Orders.Status FROM Orders INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID ORDER BY Orders.OrderDate DESC LIMIT 5').all()));
app.get('/api/dashboard/low-stock', (req, res) => res.json(db.prepare('SELECT * FROM Products WHERE Quantity < 10 ORDER BY Quantity ASC').all()));
app.get('/api/analytics/sales-by-category', (req, res) => res.json(db.prepare('SELECT p.Category, SUM(od.Quantity * od.UnitPrice) as TotalSales FROM OrderDetails od INNER JOIN Products p ON od.ProductID = p.ProductID GROUP BY p.Category ORDER BY TotalSales DESC').all()));
app.get('/api/analytics/top-products', (req, res) => res.json(db.prepare('SELECT p.ProductID, p.ProductName, SUM(od.Quantity) as TotalSold FROM OrderDetails od INNER JOIN Products p ON od.ProductID = p.ProductID GROUP BY p.ProductID ORDER BY TotalSold DESC LIMIT 5').all()));
app.get('/api/analytics/monthly-sales', (req, res) => res.json(db.prepare("SELECT strftime('%Y-%m', OrderDate) as Month, SUM(TotalAmount) as Revenue FROM Orders GROUP BY Month ORDER BY Month DESC LIMIT 6").all().reverse()));
app.get('/api/analytics/customer-stats', (req, res) => res.json(db.prepare('SELECT c.CustomerID, c.CustomerName, COUNT(o.OrderID) as TotalOrders, SUM(o.TotalAmount) as TotalSpent FROM Customers c LEFT JOIN Orders o ON c.CustomerID = o.CustomerID GROUP BY c.CustomerID ORDER BY TotalSpent DESC').all()));

app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
