import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Create form resets to default values after successful submission", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_form_reset_after_success", "Create form resets to default values after successful submission");

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  try {
    await recorder.step("Register successful order placement mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_create_success" });
    });

    await recorder.step("Navigate to orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Submit a valid new product order", async () => {
      await page.getByText("Order New Product", { exact: true }).click();
      await page.locator("#order-new-name").fill("Organic Coffee Beans");
      await page.locator("#order-category").selectOption("Beverages");
      await page.locator("#order-qty").fill("10");
      await page.locator("#order-price").fill("25.50");
      await page.locator("#expected-arrival").fill("2024-07-15");
      await page.getByRole("button", { name: "Place Replenish Order" }).click();
    });

    await recorder.step("Verify app reset defaults", async () => {
      await expect(page.locator("#order-new-name")).toHaveValue("");
      await expect(page.locator("#order-qty")).toHaveValue("50");
      await expect(page.locator("#order-price")).toHaveValue("100");
      await expect(page.locator("#expected-arrival")).not.toHaveValue("2024-07-15");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_form_reset_after_success");
  } finally {
    await recorder.save(testInfo);
  }
});
