import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("App loads with inventory table visible on launch", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder({
    testId: "app_initial_load_inventory_table_rendered",
    testTitle: "App loads with inventory table visible on launch",
  });

  await setupInventoryAppMocks(page, {
    scenario: "inventory_table_default",
    delayMs: 250,
  });

  await recorder.step("Launch inventory route", async () => {
    await page.goto("/inventory");
  });

  await recorder.step("Verify initial loading state", async () => {
    await expect(page.getByText("Loading inventory data...")).toBeVisible();
  });

  await recorder.step("Verify inventory header and summary cards", async () => {
    await expect(page.getByRole("heading", { name: "Inventory Items" })).toBeVisible();
    await expect(page.getByText("Filtered Count:")).toBeVisible();
    await expect(page.getByText("Total Stock Units:")).toBeVisible();
  });

  await recorder.step("Verify inventory table columns", async () => {
    await expect(page.getByRole("columnheader", { name: "Item Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Category" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "State" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Stock Quantity" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Last Stock-In" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Next Arrival" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Expiry Status" })).toBeVisible();
  });

  await recorder.step("Verify seeded inventory rows render", async () => {
    await expect(page.getByRole("cell", { name: "Widget A" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Orange Juice" })).toBeVisible();
  });

  console.log("CODEVALID_TEST_ASSERTION_OK:app_initial_load_inventory_table_rendered");
  await recorder.save(testInfo);
});
