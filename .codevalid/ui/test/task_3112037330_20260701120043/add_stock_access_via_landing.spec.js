import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

test("Access Add Stock via Layout Page", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_access_via_landing", "Access Add Stock via Layout Page");

  try {
    await recorder.step("Register mocked API responses for application shell and inventory-related pages");
    await mockHomePageApis(page, {
      inventory: [
        {
          id: "item-1",
          name: "Milk",
          category: "Dairy",
          quantity: 8,
          physicalState: "Liquid",
          expiryDate: "2026-07-20",
          lastStockInDate: "2026-06-20",
          salesTrend: [],
          seasonalSales: []
        }
      ],
      categories: [
        { id: "cat-1", name: "Dairy", description: "Dairy items" }
      ],
      orders: [
        {
          id: "order-1",
          itemName: "Milk",
          category: "Dairy",
          quantity: 10,
          expectedArrivalDate: "2026-07-05",
          status: "pending"
        }
      ]
    });

    await recorder.step("Navigate to route '/'");
    await page.goto("/");

    await recorder.step("Confirm the layout loads and the sidebar Add Stock navigation link is visible");
    await expect(page.getByRole("link", { name: "Add Stock" })).toBeVisible();

    await recorder.step("Click the navigation link to 'Add Stock'");
    await page.getByRole("link", { name: "Add Stock" }).click();

    await recorder.step("Verify the URL changes to '/add-stock'");
    await expect(page).toHaveURL(/\/add-stock$/);

    await recorder.step("Confirm the Add Stock page renders without error");
    await expect(page.getByRole("heading", { name: "Add Stock" })).toBeVisible();
    await expect(page.getByText("Register new incoming stock arrivals and update inventory levels")).toBeVisible();
    await expect(page.getByText("Incoming Stock Form")).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_access_via_landing");
  } finally {
    await recorder.save(testInfo);
  }
});
