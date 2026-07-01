import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Receive Order action updates inventory and order status", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_receive_order_mark_as_delivered",
    testTitle: "Receive Order action updates inventory and order status",
  });

  await setupInventoryAppMocks(page, {
    scenario: "receive_order_updates_inventory",
  });

  page.on("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Order marked as delivered! Inventory stock has been automatically updated.");
    await dialog.accept();
  });

  await recorder.step("Open orders page", async () => {
    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: "Replenish Orders" })).toBeVisible();
  });

  await recorder.step("Receive pending order for Widget A", async () => {
    const pendingCard = page.locator(".quick-list-item", { has: page.getByText("Widget A") }).first();
    await expect(pendingCard).toContainText("Qty:");
    await pendingCard.getByRole("button", { name: "Receive" }).click();
  });

  await recorder.step("Verify order moved to delivered history", async () => {
    await expect(page.getByRole("heading", { name: /Completed Orders History/i })).toBeVisible();
    await expect(page.getByText("Delivered")).toBeVisible();
  });

  await recorder.step("Verify inventory quantity and last stock-in updated", async () => {
    await page.goto("/inventory");
    const row = page.locator("tr", { has: page.getByRole("cell", { name: "Widget A" }) });
    await expect(row).toBeVisible();
    await expect(row.getByText("30")).toBeVisible();
    await expect(row.getByText("2024-06-20")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_receive_order_mark_as_delivered");
  await recorder.save(testInfo);
});
