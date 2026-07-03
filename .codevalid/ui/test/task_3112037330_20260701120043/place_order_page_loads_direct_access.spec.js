import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("PlaceOrder Page Loads Directly via /orders", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("place_order_page_loads_direct_access", "PlaceOrder Page Loads Directly via /orders");

  await recorder.step("Register mocked inventory, category, and order APIs for the orders page", async () => {
    await setupInventoryAppMocks(page, { scenario: "default" });
  });

  await recorder.step("Navigate directly to /orders", async () => {
    await page.goto("/orders", { waitUntil: "domcontentloaded" });
  });

  await recorder.step("Verify the orders page loads without redirect or blank state", async () => {
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole("heading", { name: "Replenish Orders" })).toBeVisible();
    await expect(page.getByText("Order future stocks, track pending shipments, and receive items directly into store inventory")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Place Order" })).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:place_order_page_loads_direct_access");
  await recorder.save(testInfo);
});
