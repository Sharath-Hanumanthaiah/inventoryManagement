import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks } from "../../helpers/mock-api.js";

test("Layout persists sidebar and highlights active route across known routes", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder(
    "layout_known_routes_persistent_shell_and_active_highlight",
    "Layout Persists Sidebar and Highlights Active Route Across All Known Routes"
  );

  const assertPersistentSidebar = async () => {
    await expect(page.getByText("Apex Inventory", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inventory Items" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Add Stock" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Categories & Layout" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Replenish Orders" })).toBeVisible();
  };

  const assertGlobalIndicators = async () => {
    await expect(page.getByText(/low stock/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Replenish Orders" })).toContainText("1");
  };

  try {
    await recorder.step("Register mocked API responses with low stock inventory and pending supplier orders", async () => {
      await setupInventoryAppMocks(page, { scenario: "default" });
    });

    await recorder.step("Navigate to '/' and verify the dashboard is rendered with persistent layout and active Dashboard link", async () => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/$/);
      await assertPersistentSidebar();
      await expect(page.getByRole("link", { name: "Dashboard" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
      await assertGlobalIndicators();
    });

    await recorder.step("Navigate to '/inventory' and verify the sidebar persists, Inventory Items is active, and inventory page content is shown", async () => {
      await page.goto("/inventory");
      await expect(page).toHaveURL(/\/inventory$/);
      await assertPersistentSidebar();
      await expect(page.getByRole("link", { name: "Inventory Items" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: "Inventory Items", exact: true })).toBeVisible();
      await assertGlobalIndicators();
    });

    await recorder.step("Navigate to '/add-stock' and verify the sidebar persists, Add Stock is active, and add stock page content is shown", async () => {
      await page.goto("/add-stock");
      await expect(page).toHaveURL(/\/add-stock$/);
      await assertPersistentSidebar();
      await expect(page.getByRole("link", { name: "Add Stock" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: /add stock/i })).toBeVisible();
      await assertGlobalIndicators();
    });

    await recorder.step("Navigate to '/categories' and verify the sidebar persists, Categories & Layout is active, and categories page content is shown", async () => {
      await page.goto("/categories");
      await expect(page).toHaveURL(/\/categories$/);
      await assertPersistentSidebar();
      await expect(page.getByRole("link", { name: "Categories & Layout" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: /categories/i })).toBeVisible();
      await assertGlobalIndicators();
    });

    await recorder.step("Navigate to '/orders' and verify the sidebar persists, Replenish Orders is active, and orders page content is shown", async () => {
      await page.goto("/orders");
      await expect(page).toHaveURL(/\/orders$/);
      await assertPersistentSidebar();
      await expect(page.getByRole("link", { name: "Replenish Orders" })).toHaveClass(/active/);
      await expect(page.getByRole("heading", { name: /replenish orders/i })).toBeVisible();
      await assertGlobalIndicators();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:layout_known_routes_persistent_shell_and_active_highlight");
  } finally {
    await recorder.save(testInfo);
  }
});
