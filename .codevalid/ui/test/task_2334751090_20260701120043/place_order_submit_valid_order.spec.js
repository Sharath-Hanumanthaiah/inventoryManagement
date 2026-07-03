import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Successfully Submit Valid Replenishment Order", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "place_order_submit_valid_order",
    "Successfully Submit Valid Replenishment Order"
  );

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await recorder.step("Register mock APIs for successful order creation", async () => {
      await setupInventoryAppMocks(page, { scenario: "place_order_create_success" });
    });

    await recorder.step("Open orders page and switch to new product mode", async () => {
      await page.goto("/orders");
      await expect(page.getByRole("heading", { name: "Replenish Orders", exact: true })).toBeVisible();
      await page.getByText("Order New Product", { exact: true }).click();
      await expect(page.locator("#order-new-name")).toBeVisible();
    });

    await recorder.step("Fill valid replenishment order details", async () => {
      await page.locator("#order-new-name").fill("Organic Quinoa");
      await page.locator("#order-category").selectOption("Groceries");
      await page.getByText("Solid", { exact: true }).click();
      await page.locator("#order-qty").fill("10");
      await page.locator("#order-price").fill("25.99");
      await page.locator("#expected-arrival").fill("2024-08-20");
    });

    await recorder.step("Submit the order and verify pending delivery plus form reset", async () => {
      await page.getByRole("button", { name: "Place Replenish Order", exact: true }).click();

      const pendingCard = page.locator(".quick-list-item", {
        has: page.getByText("Organic Quinoa", { exact: true }),
      }).first();

      await expect(pendingCard).toBeVisible();
      await expect(pendingCard.getByText("Groceries", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("10", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("$25.99", { exact: true })).toBeVisible();
      await expect(pendingCard.getByText("2024-08-20", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Pending Deliveries \(1\)/ })).toBeVisible();

      await expect(page.locator("#order-new-name")).toHaveValue("");
      await expect(page.locator("#order-qty")).toHaveValue("50");
      await expect(page.locator("#order-price")).toHaveValue("100");
      await expect(page.locator("#expected-arrival")).toHaveValue("2024-08-20");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:place_order_submit_valid_order");
  } finally {
    await recorder.save(testInfo);
  }
});
