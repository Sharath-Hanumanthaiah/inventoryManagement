import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Cancel pending order requires user confirmation and does not update inventory", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_cancel_pending_order_with_confirmation", "Cancel pending order requires user confirmation and does not update inventory");

  let confirmMessage = "";
  page.on("dialog", async (dialog) => {
    confirmMessage = dialog.message();
    await dialog.accept();
  });

  try {
    await recorder.step("Register cancel-order mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_cancel_pending" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Cancel the pending order", async () => {
      const pendingCard = page.locator(".quick-list-item", {
        has: page.getByText("Organic Coffee Beans", { exact: true }),
      }).first();
      await expect(pendingCard).toBeVisible();
      await pendingCard.getByRole("button", { name: "Cancel" }).click();
    });

    await recorder.step("Verify confirmation and removal from pending list", async () => {
      await expect.poll(() => confirmMessage).toBe("Are you sure you want to cancel this order?");
      await expect(page.getByText("Pending Deliveries (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify inventory unchanged after cancellation", async () => {
      await page.goto("/inventory");
      await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();
      const inventoryRow = page.locator("tbody tr", { hasText: "Organic Coffee Beans" }).first();
      await expect(inventoryRow).toContainText("20");

      await page.goto("/orders");
      // App DELETEs canceled orders — they do not appear in completed history
      await expect(page.getByText("Completed Orders History (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No order history", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_cancel_pending_order_with_confirmation");
  } finally {
    await recorder.save(testInfo);
  }
});
