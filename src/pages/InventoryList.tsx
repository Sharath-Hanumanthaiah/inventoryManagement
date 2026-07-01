import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Droplet, 
  Box, 
  AlertCircle, 
  Calendar,
  Layers,
  FilterX
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import type { InventoryItem, Category } from '../services/api';

export const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nextArrivals, setNextArrivals] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedItems, fetchedCategories, fetchedOrders] = await Promise.all([
        inventoryApi.getItems(),
        inventoryApi.getCategories(),
        inventoryApi.getOrders()
      ]);
      setItems(fetchedItems);
      setCategories(fetchedCategories);

      // Pre-compute next arrival for each item
      const arrivals: Record<string, string | null> = {};
      fetchedItems.forEach(item => {
        const pending = fetchedOrders
          .filter(o => o.itemName.toLowerCase() === item.name.toLowerCase() && o.status === 'pending')
          .sort((a, b) => new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime());
        arrivals[item.id] = pending.length > 0 ? pending[0].expectedArrival : null;
      });
      setNextArrivals(arrivals);
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update item quantity
  const handleQuantityChange = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    await inventoryApi.updateItemQuantity(id, newQty);
    loadData();
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item from the inventory?')) {
      await inventoryApi.deleteItem(id);
      loadData();
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesState = selectedState ? item.state === selectedState : true;
    
    let matchesStatus = true;
    if (selectedStatus === 'outofstock') {
      matchesStatus = item.quantity === 0;
    } else if (selectedStatus === 'lowstock') {
      matchesStatus = item.quantity > 0 && item.quantity <= 5;
    } else if (selectedStatus === 'instock') {
      matchesStatus = item.quantity > 5;
    }

    return matchesSearch && matchesCategory && matchesState && matchesStatus;
  });

  // Calculate items stats
  const totalQuantity = filteredItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Helper: check if date is close to today (within 7 days)
  const isNearExpiry = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr).getTime();
    const today = new Date().getTime();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const isExpired = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return expiry < today;
  };

  return (
    <div>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
          <span>Loading inventory data...</span>
        </div>
      )}
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Inventory Items</h1>
          <p>View, search, and manage current store items</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filtered Count:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)' }}>{filteredItems.length}</span>
          </div>
          <div className="panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Stock Units:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalQuantity}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="search-filter-bar">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search items by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="form-select filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Liquid/Solid Filter */}
          <select 
            className="form-select filter-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">All States</option>
            <option value="solid">Solid</option>
            <option value="liquid">Liquid</option>
          </select>

          {/* Stock Status Filter */}
          <select 
            className="form-select filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="instock">In Stock (&gt;5)</option>
            <option value="lowstock">Low Stock (1-5)</option>
            <option value="outofstock">Out of Stock</option>
          </select>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory || selectedState || selectedStatus) && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedState('');
                setSelectedStatus('');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FilterX size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table Panel */}
      <div className="panel">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <Layers className="empty-state-icon" size={48} />
            <h3 className="empty-state-title">No inventory items found</h3>
            <p className="empty-state-desc">Try resetting your filters or search terms, or add new stock to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>State</th>
                  <th>Stock Quantity</th>
                  <th>Last Stock-In</th>
                  <th>Next Arrival</th>
                  <th>Expiry Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const nextArrival = nextArrivals[item.id] ?? null;
                  const isNearExp = isNearExpiry(item.expiryDate);
                  const isExp = isExpired(item.expiryDate);

                  return (
                    <tr key={item.id}>
                      {/* Name */}
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {item.name}
                      </td>

                      {/* Category */}
                      <td>{item.category}</td>

                      {/* State */}
                      <td>
                        <span className={`badge ${item.state === 'liquid' ? 'badge-liquid' : 'badge-solid'}`}>
                          {item.state === 'liquid' ? (
                            <Droplet size={12} style={{ marginRight: '4px' }} />
                          ) : (
                            <Box size={12} style={{ marginRight: '4px' }} />
                          )}
                          {item.state}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Inline adjustments */}
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          
                          <span style={{ 
                            minWidth: '24px', 
                            textAlign: 'center', 
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: item.quantity === 0 ? 'var(--color-danger)' : item.quantity <= 5 ? 'var(--color-warning)' : 'inherit'
                          }}>
                            {item.quantity}
                          </span>

                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          >
                            <Plus size={12} />
                          </button>

                          {/* Quick pill indicator */}
                          <span className={`badge ${
                            item.quantity === 0 
                              ? 'badge-outofstock' 
                              : item.quantity <= 5 
                                ? 'badge-lowstock' 
                                : 'badge-instock'
                          }`} style={{ marginLeft: '10px' }}>
                            {item.quantity === 0 ? 'Out of stock' : item.quantity <= 5 ? 'Low stock' : 'In stock'}
                          </span>
                        </div>
                      </td>

                      {/* Last Stock-In */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                          <Calendar size={14} className="text-muted" />
                          <span>{item.lastStockIn || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Next Arrival */}
                      <td>
                        {nextArrival ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                            <Calendar size={14} />
                            <span style={{ fontWeight: 600 }}>{nextArrival}</span>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>No orders placed</span>
                        )}
                      </td>

                      {/* Expiry Status */}
                      <td>
                        {item.expiryDate ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ 
                              fontSize: '0.9rem', 
                              color: isExp ? 'var(--color-danger)' : isNearExp ? 'var(--color-warning)' : 'inherit',
                              fontWeight: (isExp || isNearExp) ? 600 : 'normal'
                            }}>
                              {item.expiryDate}
                            </span>
                            {isExp && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                                <AlertCircle size={10} /> Expired!
                              </span>
                            )}
                            {!isExp && isNearExp && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                                <AlertCircle size={10} /> Expiring soon
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>No expiry</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '6px' }}
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
