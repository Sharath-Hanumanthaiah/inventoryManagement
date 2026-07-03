import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Low stock alert appears when inventory quantity is ≤5", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_low_stock_alert_displayed",
    testTitle: "Low stock alert appears when inventory quantity is ≤5",
  });

  await setupInventoryAppMocks(page, {
    scenario: "low_stock_inventory",
  });

  await recorder.step("Launch inventory page", async () => {
    await page.goto("/inventory", { waitUntil: "domcontentloaded" });
  });

  await recorder.step("Locate low stock row", async () => {
    const widgetRow = page.locator("tr", { has: page.getByRole("cell", { name: "Widget A" }) });
    await expect(widgetRow).toBeVisible();
    await expect(widgetRow.getByText("3")).toBeVisible();
  });

  await recorder.step("Verify low stock indicator is shown", async () => {
    const widgetRow = page.locator("tr", { has: page.getByRole("cell", { name: "Widget A" }) });
    await expect(widgetRow.getByText(/Low stock/i)).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_low_stock_alert_displayed");
  await recorder.save(testInfo);
});
