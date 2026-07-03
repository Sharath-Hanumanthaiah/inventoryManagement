import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Mark as received updates inventory quantity and moves order to history", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_mark_as_received_updates_inventory", "Mark as received updates inventory quantity and moves order to history");

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  try {
    await recorder.step("Register receive-order mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "receive_order_updates_inventory" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Receive pending order", async () => {
      const pendingCard = page.locator(".quick-list-item", {
        has: page.getByText("Widget A", { exact: true }),
      }).first();
      await expect(pendingCard).toBeVisible();
      await pendingCard.getByRole("button", { name: "Receive" }).click();
    });

    await recorder.step("Verify pending count decreases and completed history shows delivered status", async () => {
      await expect(page.getByText("Pending Deliveries (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("Completed Orders History (1)", { exact: true })).toBeVisible();
      const historyRow = page.locator("tbody tr", { hasText: "Widget A" }).first();
      await expect(historyRow).toContainText("2024-06-20");
      // app renders "Recived" badge (delivery status) in the completed history
      await expect(historyRow.getByText("Recived", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify inventory quantity updated", async () => {
      await page.goto("/inventory");
      await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();
      const row = page.locator("tbody tr", { hasText: "Widget A" }).first();
      await expect(row).toContainText("30");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_mark_as_received_updates_inventory");
  } finally {
    await recorder.save(testInfo);
  }
});
