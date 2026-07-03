import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Add Stock workflow accessible via application sidebar", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_add_stock_access_via_sidebar",
    testTitle: "Add Stock workflow accessible via application sidebar",
  });

  await setupInventoryAppMocks(page, {
    scenario: "add_stock_sidebar_access",
  });

  await recorder.step("Launch app root", async () => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  await recorder.step("Navigate from sidebar to Add Stock", async () => {
    await page.getByRole("link", { name: /Add Stock/i }).click();
    await expect(page).toHaveURL(/\/add-stock$/);
  });

  await recorder.step("Verify add stock form fields are visible", async () => {
    await expect(page.getByRole("heading", { name: "Add Stock" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Incoming Stock Form" })).toBeVisible();
    await expect(page.getByLabel("Category")).toBeVisible();
    await expect(page.getByLabel("Quantity Received")).toBeVisible();
    await expect(page.getByText("Physical State", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Expiry Date")).toBeVisible();
    await expect(page.getByLabel("Stock-In Date")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Stock to Inventory" })).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_add_stock_access_via_sidebar");
  await recorder.save(testInfo);
});
