import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";

const baseInventory = [
  {
    id: "inv-1",
    name: "Milk",
    category: "Dairy",
    quantity: 12,
    physicalState: "Liquid",
    expiryDate: "2026-07-20",
    lastStockInDate: "2026-06-28",
    stockIntakeHistory: [],
    salesTrend: [3, 4, 5],
    seasonalSales: { summer: 12, winter: 10 }
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

  let inventoryState = structuredClone(baseInventory);
  const addedEntries = [];

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "GET" && path.endsWith("/api/inventory")) {
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

    if (method === "POST" && path.endsWith("/api/inventory/stock")) {
      const payload = request.postDataJSON ? request.postDataJSON() : JSON.parse(request.postData() || "{}");
      const itemName = payload.itemName || payload.name || "Unknown Item";
      const quantity = Number(payload.quantity || 0);
      const category = payload.category || "Produce";
      const physicalState = payload.physicalState || "Solid";
      const stockInDate = payload.stockInDate || "2026-07-01";
      const expiryDate = payload.expiryDate || "2026-08-01";
      const normalizedName = String(itemName).trim().toLowerCase();

      const existing = inventoryState.find((item) => item.name.trim().toLowerCase() === normalizedName);
      if (existing) {
        existing.quantity += quantity;
        existing.lastStockInDate = stockInDate;
      } else {
        inventoryState.unshift({
          id: `inv-${inventoryState.length + 1}`,
          name: itemName,
          category,
          quantity,
          physicalState,
          expiryDate,
          lastStockInDate: stockInDate,
          stockIntakeHistory: [],
          salesTrend: [0, 0, 0],
          seasonalSales: { summer: 0, winter: 0 }
        });
      }

      addedEntries.unshift({ itemName, quantity, stockInDate });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: `Successfully added ${quantity} units of ${itemName}`,
          recentEntries: addedEntries.slice(0, 5)
        })
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  try {
    await recorder.recordStep("Open the Add Stock workflow from the app to prepare session entries");
    await page.goto("/add-stock");
    await expect(page.getByRole("heading", { name: "Add Stock" })).toBeVisible();

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
      await page.getByText("New Product").click();
      await page.getByPlaceholder(/product name/i).fill(entry.name);
      await page.locator("select").filter({ has: page.locator('option:text("Select Category")') }).selectOption({ label: "Produce" });
      await page.locator("select").filter({ has: page.locator('option:text("Select Physical State")') }).selectOption({ index: 1 });
      await page.getByPlaceholder(/enter quantity/i).fill(entry.qty);
      await page.locator('input[type="date"]').first().fill(entry.date);
      await page.locator('input[type="date"]').nth(1).fill("2026-08-15");
      await page.getByRole("button", { name: /add stock|submit|save/i }).click();
      await expect(page.getByText(new RegExp(entry.name))).toBeVisible();
    }

    await recorder.recordStep("Validate the recent entries panel keeps only the five latest additions");
    const panel = page.getByText(/recent entries/i).locator("..");
    await expect(panel).toBeVisible();

    await expect(page.getByText("Session Figs")).toBeVisible();
    await expect(page.getByText("Session Eggplant")).toBeVisible();
    await expect(page.getByText("Session Dates")).toBeVisible();
    await expect(page.getByText("Session Carrots")).toBeVisible();
    await expect(page.getByText("Session Bananas")).toBeVisible();
    await expect(page.getByText("Session Apples")).toHaveCount(0);

    const visibleRecentNames = await page.locator("text=/Session (Figs|Eggplant|Dates|Carrots|Bananas)/").allTextContents();
    expect(visibleRecentNames.length).toBeGreaterThanOrEqual(5);

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_recent_entries_panel_displays_latest_stock_additions");
  } finally {
    await recorder.save(testInfo);
  }
});
