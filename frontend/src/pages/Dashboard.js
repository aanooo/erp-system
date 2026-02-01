import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, stockRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentOrders(),
        dashboardAPI.getLowStock(),
      ]);
      
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setLowStock(stockRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const chartData = [
    { name: 'Products', value: stats.totalProducts || 0 },
    { name: 'Customers', value: stats.totalCustomers || 0 },
    { name: 'Orders', value: stats.totalOrders || 0 },
    { name: 'Low Stock', value: stats.lowStockItems || 0 },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-number">{stats.totalCustomers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>System Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-content">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.OrderID}>
                    <td>#{order.OrderID}</td>
                    <td>{order.CustomerName}</td>
                    <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                    <td>${order.TotalAmount.toFixed(2)}</td>
                    <td><span className={`status ${order.Status.toLowerCase()}`}>{order.Status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent orders</p>
          )}
        </div>

        <div className="low-stock">
          <h2>Low Stock Alert</h2>
          {lowStock.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(product => (
                  <tr key={product.ProductID}>
                    <td>{product.ProductName}</td>
                    <td className="low-qty">{product.Quantity}</td>
                    <td>{product.Category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>All products are well stocked!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
