import React, { useState, useEffect } from 'react';
import { 
  ClipboardPlus, 
  CheckCircle2, 
  History,
  Droplet,
  Box,
  AlertCircle
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import type { InventoryItem, Category } from '../services/api';

export const AddStock: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingItems, setExistingItems] = useState<InventoryItem[]>([]);
  
  // Form fields
  const [itemSelectionType, setItemSelectionType] = useState<'existing' | 'new'>('existing');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [state, setState] = useState<'solid' | 'liquid'>('solid');
  const [expiryDate, setExpiryDate] = useState('');
  const [stockInDate, setStockInDate] = useState(new Date().toISOString().split('T')[0]);

  // Feedbacks
  const [successMessage, setSuccessMessage] = useState('');
  const [recentEntries, setRecentEntries] = useState<Array<{ name: string; quantity: number; date: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [cats, items] = await Promise.all([
        inventoryApi.getCategories(),
        inventoryApi.getItems()
      ]);
      setCategories(cats);
      if (cats.length > 0) setCategory(cats[0].name);
      setExistingItems(items);
      if (items.length > 0) {
        setSelectedItemId(items[0].id);
      } else {
        setItemSelectionType('new');
      }
    };
    fetchData();
  }, []);

  // Update form fields when existing item selection changes
  useEffect(() => {
    if (itemSelectionType === 'existing' && selectedItemId) {
      const item = existingItems.find(i => i.id === selectedItemId);
      if (item) {
        setCategory(item.category);
        setState(item.state);
        setExpiryDate(item.expiryDate || '');
      }
    }
  }, [selectedItemId, itemSelectionType, existingItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = '';
    if (itemSelectionType === 'existing') {
      const selected = existingItems.find(i => i.id === selectedItemId);
      if (selected) {
        finalName = selected.name;
      } else {
        alert('Please select a valid item.');
        return;
      }
    } else {
      if (!newItemName.trim()) {
        alert('Please enter an item name.');
        return;
      }
      finalName = newItemName.trim();
    }

    if (!category) {
      alert('Please select or create a category first.');
      return;
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }

    try {
      // Call Mock API to add stock
      await inventoryApi.addItem({
        name: finalName,
        category,
        quantity: qtyNum,
        state,
        expiryDate,
        lastStockIn: stockInDate
      });

      // Feedbacks
      setSuccessMessage(`Successfully added ${qtyNum} unit(s) of "${finalName}" to stock!`);
      setRecentEntries(prev => [
        { name: finalName, quantity: qtyNum, date: stockInDate },
        ...prev.slice(0, 4)
      ]);

      // Reset inputs
      if (itemSelectionType === 'new') {
        setNewItemName('');
        setExpiryDate('');
      }

      // Refresh item list
      const items = await inventoryApi.getItems();
      setExistingItems(items);

      // Fade out success message
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert('Failed to add stock. Please ensure the server is running.');
      console.error(err);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Add Stock</h1>
          <p>Register new incoming stock arrivals and update inventory levels</p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Form Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <ClipboardPlus size={20} className="text-primary" />
              Incoming Stock Form
            </h2>
          </div>

          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '20px',
              fontSize: '0.95rem',
              fontWeight: 500
            }}>
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Selection Mode Selector (Segmented control) */}
            {existingItems.length > 0 && (
              <div className="form-group">
                <label className="form-label">Stock Item Type</label>
                <div className="segmented-control">
                  <div 
                    className={`segmented-option ${itemSelectionType === 'existing' ? 'active' : ''}`}
                    onClick={() => setItemSelectionType('existing')}
                  >
                    Existing Item
                  </div>
                  <div 
                    className={`segmented-option ${itemSelectionType === 'new' ? 'active' : ''}`}
                    onClick={() => setItemSelectionType('new')}
                  >
                    New Product
                  </div>
                </div>
              </div>
            )}

            {/* Existing Item Dropdown */}
            {itemSelectionType === 'existing' && existingItems.length > 0 ? (
              <div className="form-group">
                <label className="form-label" htmlFor="existing-item-select">Select Inventory Item</label>
                <select 
                  id="existing-item-select"
                  className="form-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                >
                  {existingItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current Qty: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* New Item Text Input */
              <div className="form-group">
                <label className="form-label" htmlFor="new-item-name">Item Name</label>
                <input 
                  type="text"
                  id="new-item-name"
                  className="form-input"
                  placeholder="e.g. Greek Yoghurt Blueberry"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-row">
              {/* Category selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="category-select">Category</label>
                {categories.length > 0 ? (
                  <select 
                    id="category-select"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={itemSelectionType === 'existing'} // lock category if editing existing item
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={14} />
                    <span>No categories found! Create one first.</span>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label" htmlFor="quantity-input">Quantity Received</label>
                <input 
                  type="number"
                  id="quantity-input"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* State selection (Segmented Control) */}
            <div className="form-group">
              <label className="form-label">Physical State</label>
              {itemSelectionType === 'existing' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${state === 'liquid' ? 'badge-liquid' : 'badge-solid'}`}>
                    {state === 'liquid' ? <Droplet size={14} /> : <Box size={14} />}
                    {state}
                  </span>
                  <span className="helper-text">(Item physical state is locked)</span>
                </div>
              ) : (
                <div className="segmented-control">
                  <div 
                    className={`segmented-option ${state === 'solid' ? 'active' : ''}`}
                    onClick={() => setState('solid')}
                  >
                    Solid Product
                  </div>
                  <div 
                    className={`segmented-option ${state === 'liquid' ? 'active' : ''}`}
                    onClick={() => setState('liquid')}
                  >
                    Liquid Product
                  </div>
                </div>
              )}
            </div>

            <div className="form-row">
              {/* Expiry Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="expiry-date">Expiry Date</label>
                <input 
                  type="date"
                  id="expiry-date"
                  className="form-input"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <span className="helper-text">Leave blank if no expiry</span>
              </div>

              {/* Stock In Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="stock-in-date">Stock-In Date</label>
                <input 
                  type="date"
                  id="stock-in-date"
                  className="form-input"
                  value={stockInDate}
                  onChange={(e) => setStockInDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Stock to Inventory
              </button>
            </div>
          </form>
        </div>

        {/* History panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <History size={20} className="text-secondary" />
              Recently Logged Arrivals
            </h2>
          </div>

          {recentEntries.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <History className="empty-state-icon" size={36} />
              <p className="empty-state-title" style={{ fontSize: '1rem' }}>No recent stock added</p>
              <p className="empty-state-desc">Logged entries in this session will show up here for quick reference.</p>
            </div>
          ) : (
            <ul className="quick-list">
              {recentEntries.map((entry, idx) => (
                <li key={idx} className="quick-list-item">
                  <div className="item-main">
                    <span className="item-title">{entry.name}</span>
                    <span className="item-subtitle">Logged on {entry.date}</span>
                  </div>
                  <div className="item-meta">
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: 700, 
                      color: 'var(--secondary)',
                      backgroundColor: 'rgba(6, 182, 212, 0.08)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      +{entry.quantity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
