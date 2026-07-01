import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Truck, 
  Calendar,
  BarChart3,
  SunMoon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { inventoryApi } from '../services/api';
import type { InventoryItem, Order } from '../services/api';

export const Dashboard: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTrendItemId, setSelectedTrendItemId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedItems, fetchedOrders] = await Promise.all([
          inventoryApi.getItems(),
          inventoryApi.getOrders()
        ]);
        setItems(fetchedItems);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (items.length > 0 && !selectedTrendItemId) {
      setSelectedTrendItemId(items[0].id);
    }
  }, [items, selectedTrendItemId]);

  // Statistics calculations
  const totalItemCount = items.length;
  const outOfStockItems = items.filter(i => i.quantity === 0);
  const lowStockItems = items.filter(i => i.quantity > 0 && i.quantity <= 5);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  // Next week's stock arrivals (Expected arrival between today and 7 days from now)
  const getUpcomingStock = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return orders.filter(order => {
      if (order.status !== 'pending') return false;
      const arrivalDate = new Date(order.expectedArrival);
      return arrivalDate >= today && arrivalDate <= nextWeek;
    });
  };

  const upcomingStockThisWeek = getUpcomingStock();

  // Find item for individual trend chart
  const selectedTrendItem = items.find(i => i.id === selectedTrendItemId);

  // Sales Trend Data (Jan to Jun)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const getTrendData = () => {
    if (!selectedTrendItem) return [];
    return months.map((month, index) => ({
      name: month,
      Sales: selectedTrendItem.salesTrend[index] || 0
    }));
  };

  const trendChartData = getTrendData();

  // Overall item demand comparison (sum of sales trend)
  const getDemandComparisonData = () => {
    return items.map(item => {
      const totalSales = item.salesTrend.reduce((a, b) => a + b, 0);
      return {
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        'Total Demand': totalSales
      };
    }).sort((a, b) => b['Total Demand'] - a['Total Demand']);
  };

  const demandComparisonData = getDemandComparisonData();

  // Seasonal sales data for key items
  const getSeasonalData = () => {
    // We map seasons: Summer, Monsoon, Winter, Spring
    // We display top items
    const seasons = ['Summer', 'Monsoon', 'Winter', 'Spring'];
    
    return seasons.map(season => {
      const key = season.toLowerCase() as 'summer' | 'monsoon' | 'winter' | 'spring';
      const dataPoint: Record<string, any> = { name: season };
      
      items.forEach(item => {
        dataPoint[item.name] = item.seasonalSales[key] || 0;
      });

      return dataPoint;
    });
  };

  const seasonalData = getSeasonalData();

  // Custom colors for charts
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#f97316'];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard Overview</h1>
          <p>Real-time analytics, stock warnings, and seasonal demand intelligence</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper primary">
            <Package size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Unique Items</span>
            <span className="kpi-value">{totalItemCount}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper danger">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Out of Stock</span>
            <span className="kpi-value">{outOfStockItems.length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper warning">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Low Stock (1-5)</span>
            <span className="kpi-value">{lowStockItems.length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper secondary">
            <Truck size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Pending Orders</span>
            <span className="kpi-value">{pendingOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Center & Weekly Incoming Grid */}
      <div className="dashboard-grid">
        {/* Low and Out of Stock Alerts */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <AlertTriangle size={20} className="text-danger" />
              Stock Alert Center
            </h2>
            <span className="badge badge-outofstock" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
              {outOfStockItems.length + lowStockItems.length} Alerts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Out of Stock Section */}
            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
                Out of Stock (0 units)
              </h3>
              {outOfStockItems.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '12px' }}>
                  No items are currently out of stock. Excellent!
                </p>
              ) : (
                <ul className="quick-list">
                  {outOfStockItems.map(item => (
                    <li key={item.id} className="quick-list-item" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                      <div className="item-main">
                        <span className="item-title">{item.name}</span>
                        <span className="item-subtitle">Category: {item.category}</span>
                      </div>
                      <div className="item-meta">
                        <span className="badge badge-outofstock">Out of Stock</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Low Stock Section */}
            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--color-warning)', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></span>
                Low Stock Warning (1 to 5 units)
              </h3>
              {lowStockItems.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '12px' }}>
                  No low stock items. Inventory healthy!
                </p>
              ) : (
                <ul className="quick-list">
                  {lowStockItems.map(item => (
                    <li key={item.id} className="quick-list-item" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                      <div className="item-main">
                        <span className="item-title">{item.name}</span>
                        <span className="item-subtitle">Category: {item.category}</span>
                      </div>
                      <div className="item-meta">
                        <span className="badge badge-lowstock">{item.quantity} left</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Incoming stock in the next 7 days */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Calendar size={20} className="text-secondary" />
              Stocking Up (Coming Week)
            </h2>
            <span className="badge badge-instock" style={{ backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', padding: '2px 8px', fontSize: '0.72rem' }}>
              {upcomingStockThisWeek.length} Orders
            </span>
          </div>

          {upcomingStockThisWeek.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 10px' }}>
              <Truck size={32} className="empty-state-icon" />
              <p className="empty-state-title" style={{ fontSize: '0.9rem' }}>No arrivals this week</p>
              <p className="empty-state-desc">No replenishment orders are scheduled to arrive in the next 7 days.</p>
            </div>
          ) : (
            <ul className="quick-list">
              {upcomingStockThisWeek.map(order => (
                <li key={order.id} className="quick-list-item" style={{ borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                  <div className="item-main">
                    <span className="item-title">{order.itemName}</span>
                    <span className="item-subtitle" style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={12} />
                      Arriving: {order.expectedArrival}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      +{order.quantity}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{order.state}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Graphs Panel Grid */}
      <div className="two-col-grid">
        {/* Chart 1: Item Sales Demand Trend */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <TrendingUp size={20} className="text-primary" />
                Sales Demand Trend
              </h2>
              <span className="helper-text">Demand trend line over the past 6 months (Jan - Jun)</span>
            </div>
            
            {items.length > 0 && (
              <select 
                className="form-select" 
                style={{ width: '160px', padding: '6px 12px', fontSize: '0.85rem' }}
                value={selectedTrendItemId}
                onChange={(e) => setSelectedTrendItemId(e.target.value)}
              >
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ width: '100%', height: '280px', marginTop: '10px' }}>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }} 
                  />
                  <Area type="monotone" dataKey="Sales" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Top Demanded Products Comparison */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <BarChart3 size={20} className="text-secondary" />
              Product Demand Comparison
            </h2>
            <span className="helper-text">High vs. Low demand items (Total sales volume)</span>
          </div>

          <div style={{ width: '100%', height: '280px', marginTop: '10px' }}>
            {demandComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={demandComparisonData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} interval={0} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }} 
                  />
                  <Bar dataKey="Total Demand" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Season wise Sales Chart */}
      <div className="panel" style={{ marginTop: '12px' }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <SunMoon size={20} className="text-success" />
            Seasonal Product Performance
          </h2>
          <span className="helper-text">Comparison of sales across different seasons (Summer, Monsoon, Winter, Spring)</span>
        </div>

        <div style={{ width: '100%', height: '300px', marginTop: '15px' }}>
          {seasonalData.length > 0 && items.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={seasonalData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                {/* Dynamically create bars for the first few items so the chart isn't overcrowded */}
                {items.slice(0, 5).map((item, idx) => (
                  <Bar 
                    key={item.id} 
                    dataKey={item.name} 
                    fill={colors[idx % colors.length]} 
                    radius={[2, 2, 0, 0]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};
