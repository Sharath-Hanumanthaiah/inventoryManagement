import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { mockHomePageApis } from "../../helpers/mock-api.js";

test("Mark Pending Order as Delivered", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_mark_as_delivered",
    "Mark Pending Order as Delivered"
  );

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await recorder.step("Register custom mocks with one pending Organic Quinoa order", async () => {
      await mockHomePageApis(page, {
        inventory: [
          {
            id: "item-rice-base",
            name: "Rice",
            category: "Grains",
            quantity: 14,
            state: "solid",
            expiryDate: "2026-01-01",
            lastStockIn: "2024-06-10",
            salesTrend: [1, 1, 1, 1, 1, 1],
            seasonalSales: { summer: 1, monsoon: 1, winter: 1, spring: 1 },
          },
        ],
        categories: [
          { id: "cat-gra", name: "Grains", description: "Grains", aisle: "Aisle 1", section: "A", shelf: "1" },
        ],
        orders: [
          {
            id: "ord-organic-quinoa-1",
            itemName: "Organic Quinoa",
            category: "Grains",
            quantity: 10,
            state: "solid",
            orderDate: "2024-08-01",
            expectedArrival: "2024-08-20",
            status: "pending",
            price: 25.99,
          },
        ],
      });
    });

    await recorder.step("Open orders page and receive the pending order", async () => {
      await page.goto("/orders");
      const pendingCard = page.locator(".quick-list-item", {
        has: page.getByText("Organic Quinoa", { exact: true }),
      }).first();
      await expect(pendingCard).toBeVisible();
      await pendingCard.getByRole("button", { name: "Receive", exact: true }).click();
    });

    await recorder.step("Verify order leaves pending panel and appears in completed history with delivered status", async () => {
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(0\)/ })).toBeVisible();
      await expect(page.locator(".quick-list-item", { has: page.getByText("Organic Quinoa", { exact: true }) })).toHaveCount(0);

      const historyRow = page.locator("tbody tr", { hasText: "Organic Quinoa" }).first();
      await expect(historyRow).toBeVisible();
      await expect(historyRow.getByText("10", { exact: true })).toBeVisible();
      await expect(historyRow.getByText("$25.99", { exact: true })).toBeVisible();
      await expect(page.getByText("Delivered", { exact: true })).toBeVisible({ timeout: 5000 });
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_mark_as_delivered");
  } finally {
    await recorder.save(testInfo);
  }
});
