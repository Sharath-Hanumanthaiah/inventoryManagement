import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Successfully create a new replenishment order with valid data", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("add_stock_happy_path_form_submission", "Successfully create a new replenishment order with valid data");

  let alertMessage = "";
  page.on("dialog", async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  try {
    await recorder.step("Register order placement mocks", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_create_success" });
    });

    await recorder.step("Navigate to replenish orders page", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
    });

    await recorder.step("Switch to new product mode", async () => {
      await page.getByText("Order New Product", { exact: true }).click();
      await expect(page.locator("#order-new-name")).toBeVisible();
    });

    await recorder.step("Enter order details", async () => {
      await page.locator("#order-new-name").fill("Organic Coffee Beans");
      await page.locator("#order-category").selectOption("Beverages");
      await page.getByText("Solid", { exact: true }).click();
      await page.locator("#order-qty").fill("10");
      await page.locator("#order-price").fill("25.50");
      await page.locator("#expected-arrival").fill("2024-07-15");
    });

    await recorder.step("Submit replenish order", async () => {
      await page.getByRole("button", { name: "Place Replenish Order" }).click();
    });

    await recorder.step("Verify success alert and pending order details", async () => {
      await expect.poll(() => alertMessage).toBe("Replenish order placed successfully!");
      await expect(page.getByText("Pending Deliveries (1)", { exact: true })).toBeVisible();

      const pendingCard = page.locator(".quick-list-item", {
        has: page.getByText("Organic Coffee Beans", { exact: true }),
      }).first();

      await expect(pendingCard.getByText("Organic Coffee Beans", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("Beverages", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("Qty:", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("10", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("solid", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("$25.5", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("2024-07-15", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify form reset to app defaults", async () => {
      await expect(page.locator("#order-new-name")).toHaveValue("");
      await expect(page.locator("#order-qty")).toHaveValue("50");
      await expect(page.locator("#order-price")).toHaveValue("100");
      await expect(page.locator("#expected-arrival")).not.toHaveValue("2024-07-15");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:add_stock_happy_path_form_submission");
  } finally {
    await recorder.save(testInfo);
  }
});
