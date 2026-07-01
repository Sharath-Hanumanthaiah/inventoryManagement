/**
 * mock-data.js
 * Static mock data for the Inventory Management app API responses.
 * Used by mock-server.js to serve fake API endpoints during Playwright tests.
 */

export const mockCategories = [
  {
    id: "cat-001",
    name: "Beverages",
    description: "Drinks and liquid refreshments",
    aisle: "A",
    section: "1",
    shelf: "Top",
  },
  {
    id: "cat-002",
    name: "Snacks",
    description: "Packaged snack foods",
    aisle: "B",
    section: "2",
    shelf: "Middle",
  },
  {
    id: "cat-003",
    name: "Dairy",
    description: "Milk, cheese and dairy products",
    aisle: "C",
    section: "3",
    shelf: "Bottom",
  },
  {
    id: "cat-004",
    name: "Frozen",
    description: "Frozen foods and ice cream",
    aisle: "D",
    section: "4",
    shelf: "Top",
  },
];

export const mockItems = [
  {
    id: "item-001",
    name: "Orange Juice",
    category: "Beverages",
    quantity: 45,
    state: "liquid",
    expiryDate: "2026-09-01",
    lastStockIn: "2026-06-15",
    salesTrend: [120, 135, 110, 150, 160, 145],
    seasonalSales: { summer: 200, monsoon: 130, winter: 80, spring: 150 },
  },
  {
    id: "item-002",
    name: "Potato Chips",
    category: "Snacks",
    quantity: 3,
    state: "solid",
    expiryDate: "2026-12-31",
    lastStockIn: "2026-05-20",
    salesTrend: [80, 90, 85, 95, 100, 110],
    seasonalSales: { summer: 120, monsoon: 90, winter: 70, spring: 100 },
  },
  {
    id: "item-003",
    name: "Whole Milk",
    category: "Dairy",
    quantity: 0,
    state: "liquid",
    expiryDate: "2026-07-10",
    lastStockIn: "2026-06-28",
    salesTrend: [200, 195, 210, 205, 220, 215],
    seasonalSales: { summer: 180, monsoon: 200, winter: 250, spring: 210 },
  },
  {
    id: "item-004",
    name: "Vanilla Ice Cream",
    category: "Frozen",
    quantity: 20,
    state: "solid",
    expiryDate: "2027-01-15",
    lastStockIn: "2026-06-10",
    salesTrend: [50, 60, 40, 55, 80, 95],
    seasonalSales: { summer: 300, monsoon: 100, winter: 40, spring: 120 },
  },
  {
    id: "item-005",
    name: "Greek Yogurt",
    category: "Dairy",
    quantity: 5,
    state: "solid",
    expiryDate: "2026-07-20",
    lastStockIn: "2026-06-25",
    salesTrend: [60, 65, 70, 75, 80, 85],
    seasonalSales: { summer: 90, monsoon: 70, winter: 60, spring: 80 },
  },
];

export const mockOrders = [
  {
    id: "order-001",
    itemName: "Whole Milk",
    category: "Dairy",
    quantity: 50,
    state: "liquid",
    orderDate: "2026-06-25",
    expectedArrival: "2026-07-03",
    status: "pending",
    price: 75.0,
  },
  {
    id: "order-002",
    itemName: "Potato Chips",
    category: "Snacks",
    quantity: 100,
    state: "solid",
    orderDate: "2026-06-28",
    expectedArrival: "2026-07-05",
    status: "pending",
    price: 120.0,
  },
  {
    id: "order-003",
    itemName: "Orange Juice",
    category: "Beverages",
    quantity: 30,
    state: "liquid",
    orderDate: "2026-06-01",
    expectedArrival: "2026-06-10",
    status: "delivered",
    price: 90.0,
  },
];
