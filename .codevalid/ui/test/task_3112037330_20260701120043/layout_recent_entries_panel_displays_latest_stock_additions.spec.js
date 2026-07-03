import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";

// The app uses /api/items for GET and POST (not /api/inventory or /api/inventory/stock)
const baseInventory = [
  {
    id: "inv-1",
    name: "Milk",
    category: "Dairy",
    quantity: 12,
    state: "liquid",
    expiryDate: "2026-07-20",
    lastStockIn: "2026-06-28",
    salesTrend: [3, 4, 5, 4, 3, 5],
    seasonalSales: { summer: 12, monsoon: 10, winter: 8, spring: 11 }
  }
];

const categoriesResponse = [
  { id: "cat-1", name: "Dairy", description: "Dairy goods" },
  { id: "cat-2", name: "Produce", description: "Fresh produce" },
  { id: "cat-3", name: "Bakery", description: "Baked goods" }
];

const ordersResponse = [];

test("Recent Entries Panel Shows Up to Five Stock Additions from Session", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_recent_entries_panel_displays_latest_stock_additions", "Recent Entries Panel Shows Up to Five Stock Additions from Session");

  let inventoryState = JSON.parse(JSON.stringify(baseInventory));

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    // App fetches items via GET /api/items
    if (method === "GET" && path.endsWith("/api/items")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(inventoryState) });
      return;
    }

    if (method === "GET" && path.endsWith("/api/categories")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(categoriesResponse) });
      return;
    }

    if (method === "GET" && path.endsWith("/api/orders")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ordersResponse) });
      return;
    }

    // App posts new items via POST /api/items
    if (method === "POST" && path.endsWith("/api/items")) {
      let payload = {};
      try { payload = JSON.parse(request.postData() || "{}"); } catch { payload = {}; }

      const itemName = String(payload.name || "").trim();
      const quantity = Number(payload.quantity || 0);
      const normalizedName = itemName.toLowerCase();

      const existing = inventoryState.find((item) => item.name.trim().toLowerCase() === normalizedName);
      if (existing) {
        existing.quantity += quantity;
        existing.lastStockIn = payload.lastStockIn || existing.lastStockIn;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(existing) });
      } else {
        const newItem = {
          id: `inv-${inventoryState.length + 1}`,
          name: itemName,
          category: payload.category || "Produce",
          quantity,
          state: payload.state || "solid",
          expiryDate: payload.expiryDate || "",
          lastStockIn: payload.lastStockIn || "",
          salesTrend: [0, 0, 0, 0, 0, 0],
          seasonalSales: { summer: 0, monsoon: 0, winter: 0, spring: 0 }
        };
        inventoryState.push(newItem);
        await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(newItem) });
      }
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  try {
    await recorder.recordStep("Open the Add Stock workflow");
    await page.goto("/add-stock", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Add Stock", exact: true })).toBeVisible();

    // The form starts in "existing" mode since Milk exists.
    // Submit 6 new-product entries to fill and overflow the recent entries panel (max 5).
    const entries = [
      { name: "Session Apples", qty: "3", date: "2026-07-01" },
      { name: "Session Bananas", qty: "4", date: "2026-07-02" },
      { name: "Session Carrots", qty: "5", date: "2026-07-03" },
      { name: "Session Dates", qty: "6", date: "2026-07-04" },
      { name: "Session Eggplant", qty: "7", date: "2026-07-05" },
      { name: "Session Figs", qty: "8", date: "2026-07-06" }
    ];

    for (const [index, entry] of entries.entries()) {
      await recorder.recordStep(`Submit stock addition ${index + 1} for ${entry.name}`);
      // Switch to "New Product" mode each iteration (the segmented control is visible when items exist)
      await page.getByText("New Product").first().click();
      await expect(page.locator("#new-item-name")).toBeVisible();
      await page.locator("#new-item-name").fill(entry.name);
      await page.locator("#category-select").selectOption("Produce");
      await page.locator("#quantity-input").fill(entry.qty);
      await page.locator("#stock-in-date").fill(entry.date);
      await page.getByRole("button", { name: "Add Stock to Inventory" }).click();
      // Wait for the success banner which includes the item name
      await expect(page.getByText(new RegExp(`Successfully added.*${entry.name}`, "i"))).toBeVisible({ timeout: 5000 });
    }

    await recorder.recordStep("Validate the recent entries panel keeps only the five latest additions");
    // The panel title is "Recently Logged Arrivals" and items are in .quick-list .item-title
    const itemTitles = page.locator(".quick-list .item-title");
    await expect(itemTitles).toHaveCount(5);

    // Most recent (Session Figs) should be first, Session Apples (6th) should be gone
    await expect(page.locator(".quick-list .item-title").nth(0)).toHaveText("Session Figs");
    await expect(page.locator(".quick-list .item-title").nth(1)).toHaveText("Session Eggplant");
    await expect(page.locator(".quick-list .item-title").nth(2)).toHaveText("Session Dates");
    await expect(page.locator(".quick-list .item-title").nth(3)).toHaveText("Session Carrots");
    await expect(page.locator(".quick-list .item-title").nth(4)).toHaveText("Session Bananas");
    await expect(page.getByText("Session Apples")).toHaveCount(0);

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_recent_entries_panel_displays_latest_stock_additions");
  } finally {
    await recorder.save(testInfo);
  }
});
