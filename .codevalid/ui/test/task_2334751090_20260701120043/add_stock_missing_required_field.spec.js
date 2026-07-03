import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Form validation prevents submission when required fields are missing", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_missing_required_field", "Form validation prevents submission when required fields are missing");

  let alertMessage = "";
  page.on("dialog", async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  try {
    await recorder.step("Register validation mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_validation_missing_name" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Switch to new product mode and leave product name empty", async () => {
      await page.getByText("Order New Product", { exact: true }).click();
      await expect(page.locator("#order-new-name")).toBeVisible();
      await page.locator("#order-new-name").fill("");
      await page.locator("#order-qty").fill("5");
      await page.locator("#order-price").fill("20.00");
      await page.locator("#expected-arrival").fill("2024-07-15");
    });

    await recorder.step("Submit invalid form", async () => {
      await page.getByRole("button", { name: "Place Replenish Order" }).click();
    });

    await recorder.step("Verify validation alert and no order created", async () => {
      await expect.poll(() => alertMessage).toBe("Please enter the item name.");
      await expect(page.getByText("Pending Deliveries (0)", { exact: true })).toBeVisible();
      await expect(page.getByText("No orders in transit", { exact: true })).toBeVisible();
      await expect(page.locator("#order-qty")).toHaveValue("5");
      await expect(page.locator("#order-price")).toHaveValue("20.00");
      await expect(page.locator("#expected-arrival")).toHaveValue("2024-07-15");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_missing_required_field");
  } finally {
    await recorder.save(testInfo);
  }
});
