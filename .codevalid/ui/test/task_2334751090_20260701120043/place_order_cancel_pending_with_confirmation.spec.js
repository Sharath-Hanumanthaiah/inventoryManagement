import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Cancel Pending Order with Confirmation Dialog", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_cancel_pending_with_confirmation",
    "Cancel Pending Order with Confirmation Dialog"
  );

  try {
    let confirmMessage = "";
    page.on("dialog", async (dialog) => {
      confirmMessage = dialog.message();
      await dialog.accept();
    });

    await recorder.step("Register mock APIs with a cancelable pending order", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_cancel_pending" });
    });

    await recorder.step("Open orders page and cancel the pending order", async () => {
      await page.goto("/orders");
      const pendingCard = page.locator(".quick-list-item", {
        has: page.getByText("Organic Coffee Beans", { exact: true }),
      }).first();
      await expect(pendingCard).toBeVisible();
      await pendingCard.getByRole("button", { name: "Cancel", exact: true }).click();
    });

    await recorder.step("Verify browser confirmation dialog and canceled pending order outcome", async () => {
      await expect.poll(() => confirmMessage).toBe("Are you sure you want to cancel this order?");
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(0\)/ })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: "Organic Coffee Beans" })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: /Completed Orders History \(0\)/ })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_cancel_pending_with_confirmation");
  } finally {
    await recorder.save(testInfo);
  }
});
