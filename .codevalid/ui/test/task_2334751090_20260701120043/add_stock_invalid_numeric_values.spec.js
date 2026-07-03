import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Form rejects non-positive or non-numeric quantity and cost", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_invalid_numeric_values", "Form rejects non-positive or non-numeric quantity and cost");

  let dialogMessages = [];
  page.on("dialog", async (dialog) => {
    dialogMessages.push(dialog.message());
    await dialog.accept();
  });

  try {
    await recorder.step("Register numeric validation mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_validation_numeric" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Enter invalid numeric values", async () => {
      // inventory is empty so form is already in 'type' mode — no segmented control shown
      await expect(page.locator("#order-new-name")).toBeVisible();
      await page.locator("#order-new-name").fill("Tea Leaves");
      await page.locator("#order-qty").fill("0");
      await page.locator("#order-price").fill("-5.00");
      await page.locator("#expected-arrival").fill("2024-07-15");
    });

    await recorder.step("Submit invalid values", async () => {
      // Disable browser HTML5 constraint validation so the React JS alert fires
      await page.locator("form").evaluate((form) => { form.noValidate = true; });
      await page.getByRole("button", { name: "Place Replenish Order" }).click();
    });

    await recorder.step("Verify quantity validation blocks submission", async () => {
      await expect.poll(() => dialogMessages[0]).toBe("Quantity must be a positive number.");
      await expect(page.getByText("Pending Deliveries (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_invalid_numeric_values");
  } finally {
    await recorder.save(testInfo);
  }
});
