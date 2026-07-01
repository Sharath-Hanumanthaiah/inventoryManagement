import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("PlaceOrder Page Loads via Layout Navigation", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("place_order_page_loads_via_layout", testInfo);

  await recorder.step("Register mocked inventory, category, and order APIs for layout navigation", async () => {
    await setupInventoryAppMocks(page, { scenario: "default" });
  });

  await recorder.step("Navigate to the dashboard root route", async () => {
    await page.goto("/");
  });

  await recorder.step("Use the sidebar navigation to open Replenish Orders", async () => {
    await page.getByRole("link", { name: /Replenish Orders/i }).click();
  });

  await recorder.step("Verify the app lands on /orders and renders the page content", async () => {
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole("heading", { name: "Replenish Orders" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Place Order" })).toBeVisible();
    await expect(page.getByText("Order future stocks, track pending shipments, and receive items directly into store inventory")).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:place_order_page_loads_via_layout");
  await recorder.save(testInfo);
});
