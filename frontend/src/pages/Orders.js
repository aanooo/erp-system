import React, { useState, useEffect } from 'react';
import { orderAPI, customerAPI, productAPI } from '../services/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  
  const [newOrder, setNewOrder] = useState({
    CustomerID: '',
    OrderDate: new Date().toISOString().split('T')[0],
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    ProductID: '',
    Quantity: 1
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.ProductID || currentItem.Quantity <= 0) {
      alert('Please select a product and enter quantity');
      return;
    }

    const product = products.find(p => p.ProductID === parseInt(currentItem.ProductID));
    
    if (!product) {
      alert('Product not found');
      return;
    }

    if (currentItem.Quantity > product.Quantity) {
      alert(`Only ${product.Quantity} units available in stock`);
      return;
    }

    const existingItemIndex = newOrder.items.findIndex(
      item => item.ProductID === parseInt(currentItem.ProductID)
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex].Quantity += parseInt(currentItem.Quantity);
      setNewOrder({ ...newOrder, items: updatedItems });
    } else {
      const item = {
        ProductID: parseInt(currentItem.ProductID),
        ProductName: product.ProductName,
        Quantity: parseInt(currentItem.Quantity),
        UnitPrice: product.Price
      };
      setNewOrder({ ...newOrder, items: [...newOrder.items, item] });
    }

    setCurrentItem({ ProductID: '', Quantity: 1 });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (newOrder.items.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    const orderData = {
      CustomerID: parseInt(newOrder.CustomerID),
      OrderDate: newOrder.OrderDate,
      TotalAmount: calculateTotal(),
      items: newOrder.items
    };

    try {
      await orderAPI.create(orderData);
      alert('Order created successfully!');
      setShowModal(false);
      resetOrderForm();
      fetchOrders();
      fetchProducts();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
  };

  const resetOrderForm = () => {
    setNewOrder({
      CustomerID: '',
      OrderDate: new Date().toISOString().split('T')[0],
      items: []
    });
    setCurrentItem({ ProductID: '', Quantity: 1 });
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await orderAPI.getDetails(orderId);
      setOrderDetails(response.data);
      setSelectedOrder(orders.find(o => o.OrderID === orderId));
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create Order
        </button>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.OrderID}>
                <td>#{order.OrderID}</td>
                <td>{order.CustomerName}</td>
                <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                <td>${order.TotalAmount.toFixed(2)}</td>
                <td><span className={`status ${order.Status.toLowerCase()}`}>{order.Status}</span></td>
                <td>
                  <button className="btn btn-view" onClick={() => viewOrderDetails(order.OrderID)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="order-details">
          <div className="details-header">
            <h2>Order #{selectedOrder.OrderID} Details</h2>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
          </div>
          <p><strong>Customer:</strong> {selectedOrder.CustomerName}</p>
          <p><strong>Date:</strong> {new Date(selectedOrder.OrderDate).toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail, index) => (
                <tr key={index}>
                  <td>{detail.ProductName}</td>
                  <td>{detail.Quantity}</td>
                  <td>${detail.UnitPrice.toFixed(2)}</td>
                  <td>${(detail.Quantity * detail.UnitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{textAlign: 'right'}}><strong>Total:</strong></td>
                <td><strong>${selectedOrder.TotalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Create New Order</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); resetOrderForm(); }}>&times;</button>
            </div>
            <form onSubmit={handleSubmitOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer</label>
                  <select
                    value={newOrder.CustomerID}
                    onChange={(e) => setNewOrder({ ...newOrder, CustomerID: e.target.value })}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.CustomerID} value={customer.CustomerID}>
                        {customer.CustomerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Order Date</label>
                  <input
                    type="date"
                    value={newOrder.OrderDate}
                    onChange={(e) => setNewOrder({ ...newOrder, OrderDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="items-section">
                <h3>Add Items</h3>
                <div className="form-row">
                  <div className="form-group flex-2">
                    <label>Product</label>
                    <select
                      value={currentItem.ProductID}
                      onChange={(e) => setCurrentItem({ ...currentItem, ProductID: e.target.value })}
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.ProductID} value={product.ProductID}>
                          {product.ProductName} - ${product.Price} (Stock: {product.Quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={currentItem.Quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, Quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button type="button" className="btn btn-secondary" onClick={handleAddItem}>
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

              {newOrder.items.length > 0 && (
                <div className="order-items">
                  <h3>Order Items</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.ProductName}</td>
                          <td>{item.Quantity}</td>
                          <td>${item.UnitPrice.toFixed(2)}</td>
                          <td>${(item.Quantity * item.UnitPrice).toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-delete"
                              onClick={() => handleRemoveItem(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{textAlign: 'right'}}><strong>Total:</strong></td>
                        <td colSpan="2"><strong>${calculateTotal().toFixed(2)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetOrderForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
