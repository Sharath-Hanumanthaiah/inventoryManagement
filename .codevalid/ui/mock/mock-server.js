#!/usr/bin/env node
/**
 * Mock API server for CodeValid UI tests.
 *
 * Serves the same REST endpoints consumed by the React/Vite frontend:
 *   GET/POST   /api/items
 *   PUT        /api/items/:id/quantity
 *   DELETE     /api/items/:id
 *   GET/POST   /api/categories
 *   DELETE     /api/categories/:id
 *   GET/POST   /api/orders
 *   POST       /api/orders/:id/deliver
 *   DELETE     /api/orders/:id
 *
 * Run with: node .codevalid/ui/mock/mock-server.js
 * Port defaults to 5001 (matching vite proxy target), override via PORT env var.
 */

import http from "http";
import { mockCategories, mockItems, mockOrders } from "./mock-data.js";

const PORT = Number(process.env.PORT ?? 5001);

// In-memory state cloned from seed data so each server run is deterministic.
let categories = mockCategories.map((c) => ({ ...c }));
let items = mockItems.map((i) => ({
  ...i,
  salesTrend: [...i.salesTrend],
  seasonalSales: { ...i.seasonalSales },
}));
let orders = mockOrders.map((o) => ({ ...o }));

let nextId = 1000;
function generateId(prefix = "id") {
  return `${prefix}-${++nextId}`;
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // ── /api/items ──────────────────────────────────────────────────────────────
  if (pathname === "/api/items") {
    if (method === "GET") {
      return json(res, 200, items);
    }
    if (method === "POST") {
      const body = await readBody(req);
      const newItem = {
        id: generateId("item"),
        salesTrend: [0, 0, 0, 0, 0, 0],
        seasonalSales: { summer: 0, monsoon: 0, winter: 0, spring: 0 },
        ...body,
      };
      items.push(newItem);
      return json(res, 201, newItem);
    }
  }

  // PUT /api/items/:id/quantity
  const qtyMatch = pathname.match(/^\/api\/items\/([^/]+)\/quantity$/);
  if (qtyMatch && method === "PUT") {
    const id = qtyMatch[1];
    const item = items.find((i) => i.id === id);
    if (!item) return json(res, 404, { error: "Item not found" });
    const body = await readBody(req);
    item.quantity = body.quantity ?? item.quantity;
    return json(res, 200, item);
  }

  // DELETE /api/items/:id
  const itemMatch = pathname.match(/^\/api\/items\/([^/]+)$/);
  if (itemMatch && method === "DELETE") {
    const id = itemMatch[1];
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return json(res, 404, { error: "Item not found" });
    items.splice(idx, 1);
    return json(res, 204, {});
  }

  // ── /api/categories ─────────────────────────────────────────────────────────
  if (pathname === "/api/categories") {
    if (method === "GET") return json(res, 200, categories);
    if (method === "POST") {
      const body = await readBody(req);
      const newCat = { id: generateId("cat"), ...body };
      categories.push(newCat);
      return json(res, 201, newCat);
    }
  }

  // DELETE /api/categories/:id
  const catMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch && method === "DELETE") {
    const id = catMatch[1];
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return json(res, 404, { error: "Category not found" });
    categories.splice(idx, 1);
    return json(res, 204, {});
  }

  // ── /api/orders ─────────────────────────────────────────────────────────────
  if (pathname === "/api/orders") {
    if (method === "GET") return json(res, 200, orders);
    if (method === "POST") {
      const body = await readBody(req);
      const newOrder = {
        id: generateId("order"),
        status: "pending",
        ...body,
      };
      orders.push(newOrder);
      return json(res, 201, newOrder);
    }
  }

  // POST /api/orders/:id/deliver
  const deliverMatch = pathname.match(/^\/api\/orders\/([^/]+)\/deliver$/);
  if (deliverMatch && method === "POST") {
    const id = deliverMatch[1];
    const order = orders.find((o) => o.id === id);
    if (!order) return json(res, 404, { error: "Order not found" });
    order.status = "delivered";
    return json(res, 200, order);
  }

  // DELETE /api/orders/:id
  const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && method === "DELETE") {
    const id = orderMatch[1];
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return json(res, 404, { error: "Order not found" });
    orders.splice(idx, 1);
    return json(res, 204, {});
  }

  // Fallthrough — 404
  return json(res, 404, { error: `Not found: ${method} ${pathname}` });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error("Mock server error:", err);
    json(res, 500, { error: "Internal server error" });
  });
});

server.listen(PORT, () => {
  console.log(`[mock-server] Listening on http://localhost:${PORT}`);
  console.log(`[mock-server] Seeded ${items.length} items, ${categories.length} categories, ${orders.length} orders`);
});

export { server };
