import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  MapPin, 
  Truck, 
  AlertTriangle
} from 'lucide-react';
import { inventoryApi } from '../services/api';

export const Layout: React.FC = () => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Recalculate stats when navigating to different pages
    const fetchStats = async () => {
      try {
        const items = await inventoryApi.getItems();
        const lowStock = items.filter(i => i.quantity <= 5).length;
        setLowStockCount(lowStock);

        const orders = await inventoryApi.getOrders();
        const pending = orders.filter(o => o.status === 'pending').length;
        setPendingOrdersCount(pending);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-logo">
          <div className="brand-icon">
            <Store size={20} />
          </div>
          <span className="brand-name">Apex Inventory</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ul className="nav-list">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/inventory" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>Inventory Items</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/add-stock" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                <span>Add Stock</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/categories" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <MapPin size={18} />
                <span>Categories & Layout</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/orders" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Truck size={18} />
                <span>Replenish Orders</span>
                {pendingOrdersCount > 0 && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    background: 'var(--secondary)', 
                    color: '#0b0f19',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '8px'
                  }}>
                    {pendingOrdersCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>

          {/* Quick Alert Indicator in Sidebar */}
          {lowStockCount > 0 && (
            <div style={{
              marginTop: 'auto',
              marginBottom: '20px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--color-danger)'
            }}>
              <AlertTriangle size={18} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>Low Stock Alert</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lowStockCount} items need attention</span>
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            <p>Apex Store v1.0.0</p>
          </div>
        </nav>
      </aside>

      {/* Main Panel Outlet */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
