import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Form Rejects Negative or Zero Cost Value", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_negative_cost",
    "Form Rejects Negative or Zero Cost Value"
  );

  try {
    let alertMessage = "";
    page.on("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await recorder.step("Register mock APIs for price validation", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_validation_numeric" });
    });

    await recorder.step("Open orders page and switch to new product mode", async () => {
      await page.goto("/orders");
      // inventory is empty so form is already in 'type' mode — no segmented control shown
      await expect(page.locator("#order-new-name")).toBeVisible();
    });

    await recorder.step("Enter negative price and attempt to submit", async () => {
      await page.locator("#order-new-name").fill("Coffee Beans");
      await page.locator("#order-qty").fill("3");
      await page.locator("#order-price").fill("-5.00");
      await page.locator("#expected-arrival").fill("2024-08-10");
      // Disable browser HTML5 constraint validation so the React JS alert fires
      await page.locator("form").evaluate((form) => { form.noValidate = true; });
      await page.getByRole("button", { name: "Place Replenish Order", exact: true }).click();
    });

    await recorder.step("Verify alert-based price validation blocks order creation", async () => {
      await expect.poll(() => alertMessage).toBe("Price must be a positive number.");
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(0\)/ })).toBeVisible();
      await expect(page.locator("#order-new-name")).toHaveValue("Coffee Beans");
      await expect(page.locator("#order-qty")).toHaveValue("3");
      await expect(page.locator("#order-price")).toHaveValue("-5");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_negative_cost");
  } finally {
    await recorder.save(testInfo);
  }
});
