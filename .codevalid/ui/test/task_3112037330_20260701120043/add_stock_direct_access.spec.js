import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

test("Direct Access to Add Stock via /add-stock URL", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_direct_access", "Direct Access to Add Stock via /add-stock URL");

  try {
    await recorder.step("Register mocked API responses required by the Add Stock page");
    await mockHomePageApis(page, {
      inventory: [
        {
          id: "item-1",
          name: "Apples",
          category: "Fresh Produce",
          quantity: 12,
          physicalState: "Solid",
          expiryDate: "2026-07-25",
          lastStockInDate: "2026-06-28",
          salesTrend: [],
          seasonalSales: []
        }
      ],
      categories: [
        { id: "cat-1", name: "Fresh Produce", description: "Fresh fruit and vegetables" }
      ],
      orders: []
    });

    await recorder.step("Navigate directly to route '/add-stock'");
    await page.goto("/add-stock");

    await recorder.step("Confirm the AddStock component loads successfully");
    await expect(page).toHaveURL(/\/add-stock$/);
    await expect(page.getByRole("heading", { name: "Add Stock" })).toBeVisible();
    await expect(page.getByText("Register new incoming stock arrivals and update inventory levels")).toBeVisible();
    await expect(page.getByText("Incoming Stock Form")).toBeVisible();
    await expect(page.getByText("Stock Item Type")).toBeVisible();

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_direct_access");
  } finally {
    await recorder.save(testInfo);
  }
});
