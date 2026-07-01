import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";

const inventoryResponse = [
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
  { id: "cat-2", name: "Produce", description: "Fresh produce" }
];

const ordersResponse = [
  {
    id: "ord-1",
    itemName: "Milk",
    category: "Dairy",
    quantity: 20,
    status: "pending",
    expectedArrivalDate: "2026-07-05"
  }
];

test("Add Stock Navigation Link Present in Sidebar", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("layout_add_stock_sidebar_link_visible", "Add Stock Navigation Link Present in Sidebar");

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
    await recorder.recordStep("Navigate to the app shell so the sidebar layout renders");
    await page.goto("/");

    await recorder.recordStep("Locate the sidebar navigation region");
    const addStockLink = page.getByRole("link", { name: "Add Stock" });

    await recorder.recordStep("Verify the Add Stock navigation link is visible and clickable");
    await expect(addStockLink).toBeVisible();
    await expect(addStockLink).toHaveAttribute("href", "/add-stock");

    await recorder.recordStep("Confirm the link can be used to reach the Add Stock workflow");
    await addStockLink.click();
    await expect(page).toHaveURL(/\/add-stock$/);
    await expect(page.getByRole("heading", { name: "Add Stock" })).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_add_stock_sidebar_link_visible");
  } finally {
    await recorder.save(testInfo);
  }
});
