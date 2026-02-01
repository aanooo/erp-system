import React, { useState, useEffect } from 'react';
import { supplierAPI } from '../services/api';
import './Suppliers.css';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    SupplierName: '',
    ContactPerson: '',
    Email: '',
    Phone: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert('Failed to fetch suppliers');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierAPI.update(editingSupplier.SupplierID, formData);
        alert('Supplier updated successfully!');
      } else {
        await supplierAPI.create(formData);
        alert('Supplier added successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      SupplierName: supplier.SupplierName,
      ContactPerson: supplier.ContactPerson,
      Email: supplier.Email,
      Phone: supplier.Phone
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierAPI.delete(id);
        alert('Supplier deleted successfully!');
        fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Failed to delete supplier');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      SupplierName: '',
      ContactPerson: '',
      Email: '',
      Phone: ''
    });
    setEditingSupplier(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <div>
          <h1>Suppliers Management</h1>
          <p className="page-subtitle">Manage your supplier network</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Supplier
        </button>
      </div>

      <div className="suppliers-grid">
        {suppliers.map(supplier => (
          <div key={supplier.SupplierID} className="supplier-card">
            <div className="supplier-header">
              <h3>{supplier.SupplierName}</h3>
              <span className="supplier-id">#{supplier.SupplierID}</span>
            </div>
            <div className="supplier-details">
              <div className="detail-item">
                <span className="detail-icon">👤</span>
                <span>{supplier.ContactPerson}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <span>{supplier.Email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📞</span>
                <span>{supplier.Phone}</span>
              </div>
            </div>
            <div className="supplier-actions">
              <button className="btn btn-edit" onClick={() => handleEdit(supplier)}>
                Edit
              </button>
              <button className="btn btn-delete" onClick={() => handleDelete(supplier.SupplierID)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Supplier Name</label>
                <input
                  type="text"
                  name="SupplierName"
                  value={formData.SupplierName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="ContactPerson"
                  value={formData.ContactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;