import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";

const inventoryResponse = [
  {
    id: "inv-low-1",
    name: "Tomatoes",
    category: "Produce",
    quantity: 5,
    physicalState: "Solid",
    expiryDate: "2026-07-10",
    lastStockInDate: "2026-06-30",
    stockIntakeHistory: [],
    salesTrend: [6, 5, 4],
    seasonalSales: { summer: 18, winter: 9 }
  },
  {
    id: "inv-2",
    name: "Rice",
    category: "Grains",
    quantity: 20,
    physicalState: "Solid",
    expiryDate: "2027-01-01",
    lastStockInDate: "2026-06-20",
    stockIntakeHistory: [],
    salesTrend: [2, 2, 3],
    seasonalSales: { summer: 5, winter: 7 }
  }
];

const categoriesResponse = [
  { id: "cat-1", name: "Produce", description: "Fresh produce" },
  { id: "cat-2", name: "Grains", description: "Grains and staples" }
];

const ordersResponse = [
  {
    id: "ord-1",
    itemName: "Tomatoes",
    category: "Produce",
    quantity: 10,
    status: "pending",
    expectedArrivalDate: "2026-07-04"
  }
];

test("Low Stock Alerts Are Visible When Inventory Quantity Is 5 or Less", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_low_stock_alert_displayed_when_quantity_le_5", "Low Stock Alerts Are Visible When Inventory Quantity Is 5 or Less");

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "GET" && path.endsWith("/api/inventory")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(inventoryResponse) });
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

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  try {
    await recorder.recordStep("Navigate to the dashboard where global stock alerts are summarized");
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();

    await recorder.recordStep("Verify the low stock KPI and alert content are visible for quantity 5 or less");
    await expect(page.getByText("Low Stock (1-5)")).toBeVisible();
    await expect(page.getByText("1")).toBeVisible();

    await recorder.recordStep("Confirm the low stock item is surfaced in a visually distinct warning area");
    await expect(page.getByText(/Tomatoes/i)).toBeVisible();
    await expect(page.getByText(/5/)).toBeVisible();
    await expect(page.getByText(/alert|low stock|warning/i).first()).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_low_stock_alert_displayed_when_quantity_le_5");
  } finally {
    await recorder.save(testInfo);
  }
});
