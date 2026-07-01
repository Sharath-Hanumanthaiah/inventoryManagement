import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import type { Order, Category, InventoryItem } from '../services/api';

export const PlaceOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingItems, setExistingItems] = useState<InventoryItem[]>([]);

  // Form states
  const [itemMode, setItemMode] = useState<'select' | 'type'>('select');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [state, setState] = useState<'solid' | 'liquid'>('solid');
  const [expectedArrival, setExpectedArrival] = useState('');
  const [price, setPrice] = useState('100');

  // Load Data
  const loadData = async () => {
    try {
      const [fetchedOrders, fetchedCategories, fetchedItems] = await Promise.all([
        inventoryApi.getOrders(),
        inventoryApi.getCategories(),
        inventoryApi.getItems()
      ]);
      setOrders(fetchedOrders);
      setCategories(fetchedCategories);
      setExistingItems(fetchedItems);
      if (fetchedItems.length > 0) {
        setSelectedItemId(prev => prev || fetchedItems[0].id);
      } else {
        setItemMode('type');
      }
    } catch (err) {
      console.error('Error loading order data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Default expected delivery date: 5 days from now
    const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setExpectedArrival(fiveDaysLater);
  }, []);

  // Update category and state if user chooses an existing item
  useEffect(() => {
    if (itemMode === 'select' && selectedItemId) {
      const item = existingItems.find(i => i.id === selectedItemId);
      if (item) {
        setCategory(item.category);
        setState(item.state);
      }
    }
  }, [selectedItemId, itemMode, existingItems]);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = '';
    if (itemMode === 'select') {
      const selected = existingItems.find(i => i.id === selectedItemId);
      if (selected) {
        finalName = selected.name;
      } else {
        alert('Please select an item.');
        return;
      }
    } else {
      if (!newItemName.trim()) {
        alert('Please enter the item name.');
        return;
      }
      finalName = newItemName.trim();
    }

    if (!category) {
      alert('Please select a category.');
      return;
    }

    const qtyNum = Number(quantity);
    const priceNum = Number(price);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert('Quantity must be a positive number.');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      alert('Price must be a positive number.');
      return;
    }

    if (!expectedArrival) {
      alert('Please select an expected delivery date.');
      return;
    }

    try {
      await inventoryApi.placeOrder({
        itemName: finalName,
        category,
        quantity: qtyNum,
        state,
        orderDate: new Date().toISOString().split('T')[0],
        expectedArrival,
        price: priceNum
      });

      // Reset Form
      if (itemMode === 'type') setNewItemName('');
      setQuantity('50');
      setPrice('100');

      // Reload
      loadData();
      alert('Replenish order placed successfully!');
    } catch (err) {
      alert('Failed to place order. Please ensure the server is running.');
      console.error(err);
    }
  };

  const handleDeliverOrder = async (id: string) => {
    try {
      await inventoryApi.deliverOrder(id);
      loadData();
      alert('Order marked as delivered! Inventory stock has been automatically updated.');
    } catch (err) {
      alert('Failed to deliver order.');
      console.error(err);
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await inventoryApi.cancelOrder(id);
        loadData();
      } catch (err) {
        console.error('Error cancelling order:', err);
      }
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Replenish Orders</h1>
          <p>Order future stocks, track pending shipments, and receive items directly into store inventory</p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Place Order Form */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <PlusCircle size={20} className="text-primary" />
              Place Order
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Item Source Mode */}
            {existingItems.length > 0 && (
              <div className="form-group">
                <label className="form-label">Order Item Selection</label>
                <div className="segmented-control">
                  <div 
                    className={`segmented-option ${itemMode === 'select' ? 'active' : ''}`}
                    onClick={() => setItemMode('select')}
                  >
                    Restock Existing Item
                  </div>
                  <div 
                    className={`segmented-option ${itemMode === 'type' ? 'active' : ''}`}
                    onClick={() => setItemMode('type')}
                  >
                    Order New Product
                  </div>
                </div>
              </div>
            )}

            {/* Select/Type Name */}
            {itemMode === 'select' && existingItems.length > 0 ? (
              <div className="form-group">
                <label className="form-label" htmlFor="order-item-select">Select Item to Replenish</label>
                <select 
                  id="order-item-select"
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
              <div className="form-group">
                <label className="form-label" htmlFor="order-new-name">Product Name</label>
                <input 
                  type="text" 
                  id="order-new-name"
                  className="form-input" 
                  placeholder="e.g. Premium Almond Milk 1L"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Category selection */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="order-category">Category</label>
                {categories.length > 0 ? (
                  <select 
                    id="order-category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={itemMode === 'select'}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={14} />
                    <span>Create categories first!</span>
                  </div>
                )}
              </div>

              {/* Physical State */}
              <div className="form-group">
                <label className="form-label">Physical State</label>
                {itemMode === 'select' ? (
                  <div style={{ padding: '10px 0' }}>
                    <span className={`badge ${state === 'liquid' ? 'badge-liquid' : 'badge-solid'}`}>
                      {state}
                    </span>
                  </div>
                ) : (
                  <div className="segmented-control">
                    <div 
                      className={`segmented-option ${state === 'solid' ? 'active' : ''}`}
                      onClick={() => setState('solid')}
                    >
                      Solid
                    </div>
                    <div 
                      className={`segmented-option ${state === 'liquid' ? 'active' : ''}`}
                      onClick={() => setState('liquid')}
                    >
                      Liquid
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="order-qty">Quantity to Order</label>
                <input 
                  type="number" 
                  id="order-qty"
                  className="form-input" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="order-price">Total Cost ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    id="order-price"
                    className="form-input" 
                    style={{ paddingLeft: '32px' }}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Expected Arrival Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="expected-arrival">Expected Arrival Date</label>
              <input 
                type="date" 
                id="expected-arrival"
                className="form-input" 
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
                required
              />
              <span className="helper-text">When this stock will be available in store</span>
            </div>

            <div style={{ marginTop: '15px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Place Replenish Order
              </button>
            </div>
          </form>
        </div>

        {/* Pending Deliveries */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Clock size={20} className="text-secondary" />
              Pending Deliveries ({pendingOrders.length})
            </h2>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="empty-state" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Truck className="empty-state-icon" size={36} />
              <p className="empty-state-title" style={{ fontSize: '1rem' }}>No orders in transit</p>
              <p className="empty-state-desc">All stock is currently delivered. Place an order to schedule future arrivals.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
              {pendingOrders.map(order => (
                <div key={order.id} className="quick-list-item" style={{ alignItems: 'flex-start' }}>
                  <div className="item-main" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="item-title">{order.itemName}</span>
                      <span className="badge badge-solid" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        {order.category}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Qty: <strong>{order.quantity}</strong> ({order.state})
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Cost: <strong>${order.price}</strong>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--secondary)' }}>
                      <Calendar size={12} />
                      <span>Arriving by: <strong>{order.expectedArrival}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '10px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleDeliverOrder(order.id)}
                    >
                      Receive
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed/History Orders Section */}
      <div className="panel" style={{ marginTop: '12px' }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <CheckCircle size={20} className="text-success" />
            Completed Orders History ({completedOrders.length})
          </h2>
        </div>

        {completedOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p className="empty-state-title" style={{ fontSize: '0.9rem' }}>No order history</p>
            <p className="empty-state-desc">Completed order records will be listed here after you receive pending orders.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity Received</th>
                  <th>Physical State</th>
                  <th>Cost Paid</th>
                  <th>Ordered On</th>
                  <th>Arrival Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.itemName}</td>
                    <td>{order.category}</td>
                    <td style={{ fontWeight: 700 }}>{order.quantity}</td>
                    <td>
                      <span className={`badge ${order.state === 'liquid' ? 'badge-liquid' : 'badge-solid'}`}>
                        {order.state}
                      </span>
                    </td>
                    <td>${order.price}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.expectedArrival}</td>
                    <td>
                      <span className="badge badge-instock">
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
