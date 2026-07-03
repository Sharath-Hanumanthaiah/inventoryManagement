import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Form Rejects Submission Without Product Name", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_missing_product_name",
    "Form Rejects Submission Without Product Name"
  );

  try {
    let alertMessage = "";
    page.on("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await recorder.step("Register mock APIs for missing-name validation", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_validation_missing_name" });
    });

    await recorder.step("Open orders page in new product mode", async () => {
      await page.goto("/orders");
      await page.getByText("Order New Product", { exact: true }).click();
      await expect(page.locator("#order-new-name")).toBeVisible();
    });

    await recorder.step("Leave product name empty and attempt submission", async () => {
      await page.locator("#order-new-name").fill("");
      await page.locator("#order-qty").fill("5");
      await page.locator("#order-price").fill("15.50");
      await page.locator("#expected-arrival").fill("2024-08-01");
      await page.getByRole("button", { name: "Place Replenish Order", exact: true }).click();
    });

    await recorder.step("Verify alert-based validation blocks order creation", async () => {
      await expect.poll(() => alertMessage).toBe("Please enter the item name.");
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(0\)/ })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
      await expect(page.locator("#order-qty")).toHaveValue("5");
      await expect(page.locator("#order-price")).toHaveValue("15.5");
      await expect(page.locator("#expected-arrival")).toHaveValue("2024-08-01");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_missing_product_name");
  } finally {
    await recorder.save(testInfo);
  }
});
