import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Form Rejects Non-Numeric Quantity Input", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_non_numeric_quantity",
    "Form Rejects Non-Numeric Quantity Input"
  );

  try {
    let alertMessage = "";
    page.on("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await recorder.step("Register mock APIs for numeric validation", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_validation_numeric" });
    });

    await recorder.step("Open orders page and switch to new product mode", async () => {
      await page.goto("/orders");
      await page.getByText("Order New Product", { exact: true }).click();
      await expect(page.locator("#order-new-name")).toBeVisible();
    });

    await recorder.step("Fill invalid quantity value and submit", async () => {
      await page.locator("#order-new-name").fill("Apple");
      await page.locator("#order-qty").fill("abc");
      await page.locator("#order-price").fill("20.00");
      await page.locator("#expected-arrival").fill("2024-08-05");
      await page.getByRole("button", { name: "Place Replenish Order", exact: true }).click();
    });

    await recorder.step("Verify positive-number alert and unchanged form", async () => {
      await expect.poll(() => alertMessage).toBe("Quantity must be a positive number.");
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(0\)/ })).toBeVisible();
      await expect(page.locator("#order-new-name")).toHaveValue("Apple");
      await expect(page.locator("#order-price")).toHaveValue("20");
      await expect(page.locator("#expected-arrival")).toHaveValue("2024-08-05");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_non_numeric_quantity");
  } finally {
    await recorder.save(testInfo);
  }
});
