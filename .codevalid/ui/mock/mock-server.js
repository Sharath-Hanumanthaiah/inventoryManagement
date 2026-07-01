/**
 * mock-server.js
 * A lightweight HTTP mock server that mimics the backend API
 * used by the Inventory Management React/Vite app.
 *
 * Endpoints served:
 *   GET  /api/items
 *   POST /api/items
 *   PUT  /api/items/:id/quantity
 *   DELETE /api/items/:id
 *   GET  /api/categories
 *   POST /api/categories
 *   DELETE /api/categories/:id
 *   GET  /api/orders
 *   POST /api/orders
 *   POST /api/orders/:id/deliver
 *   DELETE /api/orders/:id
 *
 * Usage (standalone):
 *   node .codevalid/ui/mock/mock-server.js
 *
 * The server listens on the port defined by MOCK_PORT env var (default: 5001).
 * The Vite dev server proxies /api/* to http://localhost:5001 (see vite.config.ts).
 */

import http from "http";
import { mockCategories, mockItems, mockOrders } from "./mock-data.js";

const PORT = parseInt(process.env.MOCK_PORT || "5001", 10);

// In-memory working copies so mutation during tests doesn't affect base data.
let items = JSON.parse(JSON.stringify(mockItems));
let categories = JSON.parse(JSON.stringify(mockCategories));
let orders = JSON.parse(JSON.stringify(mockOrders));

let itemSeq = items.length + 1;
let categorySeq = categories.length + 1;
let orderSeq = orders.length + 1;

function generateId(prefix) {
  const seq = prefix === "item"
    ? itemSeq++
    : prefix === "cat"
    ? categorySeq++
    : orderSeq++;
  return `${prefix}-${String(seq).padStart(3, "0")}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

async function router(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS pre-flight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  // ── ITEMS ────────────────────────────────────────────────────────────────
  if (pathname === "/api/items" && method === "GET") {
    return send(res, 200, items);
  }

  if (pathname === "/api/items" && method === "POST") {
    const body = await readBody(req);
    const newItem = {
      id: generateId("item"),
      salesTrend: [0, 0, 0, 0, 0, 0],
      seasonalSales: { summer: 0, monsoon: 0, winter: 0, spring: 0 },
      ...body,
    };
    items.push(newItem);
    return send(res, 201, newItem);
  }

  const itemQuantityMatch = pathname.match(/^\/api\/items\/([^/]+)\/quantity$/);
  if (itemQuantityMatch && method === "PUT") {
    const id = itemQuantityMatch[1];
    const body = await readBody(req);
    const item = items.find((i) => i.id === id);
    if (!item) return send(res, 404, { error: "Item not found" });
    item.quantity = body.quantity;
    return send(res, 200, item);
  }

  const itemIdMatch = pathname.match(/^\/api\/items\/([^/]+)$/);
  if (itemIdMatch && method === "DELETE") {
    const id = itemIdMatch[1];
    const before = items.length;
    items = items.filter((i) => i.id !== id);
    if (items.length === before) return send(res, 404, { error: "Item not found" });
    return send(res, 204, {});
  }

  // ── CATEGORIES ───────────────────────────────────────────────────────────
  if (pathname === "/api/categories" && method === "GET") {
    return send(res, 200, categories);
  }

  if (pathname === "/api/categories" && method === "POST") {
    const body = await readBody(req);
    const newCat = { id: generateId("cat"), ...body };
    categories.push(newCat);
    return send(res, 201, newCat);
  }

  const catIdMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
  if (catIdMatch && method === "DELETE") {
    const id = catIdMatch[1];
    const before = categories.length;
    categories = categories.filter((c) => c.id !== id);
    if (categories.length === before) return send(res, 404, { error: "Category not found" });
    return send(res, 204, {});
  }

  // ── ORDERS ───────────────────────────────────────────────────────────────
  if (pathname === "/api/orders" && method === "GET") {
    return send(res, 200, orders);
  }

  if (pathname === "/api/orders" && method === "POST") {
    const body = await readBody(req);
    const newOrder = { id: generateId("order"), status: "pending", ...body };
    orders.push(newOrder);
    return send(res, 201, newOrder);
  }

  const orderDeliverMatch = pathname.match(/^\/api\/orders\/([^/]+)\/deliver$/);
  if (orderDeliverMatch && method === "POST") {
    const id = orderDeliverMatch[1];
    const order = orders.find((o) => o.id === id);
    if (!order) return send(res, 404, { error: "Order not found" });
    order.status = "delivered";
    return send(res, 200, order);
  }

  const orderIdMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderIdMatch && method === "DELETE") {
    const id = orderIdMatch[1];
    const before = orders.length;
    orders = orders.filter((o) => o.id !== id);
    if (orders.length === before) return send(res, 404, { error: "Order not found" });
    return send(res, 204, {});
  }

  // ── HEALTH CHECK ─────────────────────────────────────────────────────────
  if (pathname === "/health") {
    return send(res, 200, { status: "ok" });
  }

  return send(res, 404, { error: "Not found", path: pathname });
}

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error("Mock server error:", err.message);
    send(res, 500, { error: "Internal server error", message: err.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Mock API server running at http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());

export { server };
