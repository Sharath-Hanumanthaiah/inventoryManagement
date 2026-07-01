export interface Category {
  id: string;
  name: string;
  description: string;
  aisle: string;
  section: string;
  shelf: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  state: 'liquid' | 'solid';
  expiryDate: string;
  lastStockIn: string;
  salesTrend: number[]; // Sales over last 6 months (Jan-Jun)
  seasonalSales: {
    summer: number;
    monsoon: number;
    winter: number;
    spring: number;
  };
}

export interface Order {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  state: 'liquid' | 'solid';
  orderDate: string;
  expectedArrival: string;
  status: 'pending' | 'delivered';
  price: number;
}

const BASE_URL = '/api';

export const inventoryApi = {
  // Initialization no longer needed for client-side local DB as server runs its own DB file
  init: () => {},

  // ITEMS
  getItems: async (): Promise<InventoryItem[]> => {
    const res = await fetch(`${BASE_URL}/items`);
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  addItem: async (itemData: Omit<InventoryItem, 'id' | 'salesTrend' | 'seasonalSales'>): Promise<InventoryItem> => {
    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to add item');
    return res.json();
  },

  updateItemQuantity: async (id: string, newQty: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/items/${id}/quantity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });
    if (!res.ok) throw new Error('Failed to update quantity');
  },

  deleteItem: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  // CATEGORIES
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  addCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Failed to add category');
    return res.json();
  },

  deleteCategory: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  // ORDERS
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  placeOrder: async (orderData: Omit<Order, 'id' | 'status'>): Promise<Order> => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  },

  deliverOrder: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/orders/${id}/deliver`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to deliver order');
  },

  cancelOrder: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to cancel order');
  },

  // ANALYTICS HELPER (Calculated client-side from the list of orders)
  getNextArrivalDate: async (itemName: string): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/orders`);
      if (!res.ok) return null;
      const orders: Order[] = await res.json();
      const pendingForItem = orders
        .filter(o => o.itemName.toLowerCase() === itemName.toLowerCase() && o.status === 'pending')
        .sort((a, b) => new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime());
      
      return pendingForItem.length > 0 ? pendingForItem[0].expectedArrival : null;
    } catch {
      return null;
    }
  }
};
