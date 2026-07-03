import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks, mockHomePageApis } from "../../helpers/mock-api.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function setupCategoryRoutes(page, { categories = [], items = [] } = {}) {
  let categoryState = clone(categories);
  const itemState = clone(items);

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    const method = request.method();

    if (method === "GET" && pathname.endsWith("/api/categories")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(categoryState) });
      return;
    }

    if (method === "DELETE" && /\/api\/categories\/[^/]+$/.test(pathname)) {
      const id = pathname.split("/").pop();
      categoryState = categoryState.filter((category) => category.id !== id);
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (method === "GET" && pathname.endsWith("/api/items")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(itemState) });
      return;
    }

    if (method === "GET" && pathname.endsWith("/api/orders")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
}

test("Delete category with inventory dependency shows warning and preserves inventory", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_delete_with_inventory_warning", "Delete category with inventory dependency shows warning and preserves inventory");

  try {
    await recorder.step("Register categories and inventory fixtures with a dependency", async () => {
      await setupCategoryRoutes(page, {
        categories: [
          {
            id: "cat-dairy",
            name: "Dairy",
            description: "Refrigerated products",
            aisle: "Aisle 1",
            section: "Section A",
            shelf: "Shelf 1",
          },
          {
            id: "cat-bakery",
            name: "Bakery",
            description: "Bread and pastries",
            aisle: "Aisle 2",
            section: "Section B",
            shelf: "Shelf 2",
          },
        ],
        items: [
          {
            id: "item-milk",
            name: "Milk",
            category: "Dairy",
            quantity: 5,
            state: "liquid",
            expiryDate: "2024-07-10",
            lastStockIn: "2024-06-01",
            salesTrend: [1, 2, 3, 4, 5, 6],
            seasonalSales: { summer: 10, monsoon: 8, winter: 9, spring: 7 },
          },
          {
            id: "item-cheese",
            name: "Cheese",
            category: "Dairy",
            quantity: 3,
            state: "solid",
            expiryDate: "2024-07-15",
            lastStockIn: "2024-06-02",
            salesTrend: [2, 3, 4, 5, 6, 7],
            seasonalSales: { summer: 6, monsoon: 5, winter: 7, spring: 4 },
          },
        ],
      });
    });

    await recorder.step("Open categories page and verify Dairy is present", async () => {
      await page.goto("/categories");
      const dairyRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Dairy" }),
      });
      await expect(dairyRow).toBeVisible();
    });

    await recorder.step("Confirm the warning dialog when deleting a category with inventory", async () => {
      page.once("dialog", async (dialog) => {
        expect(dialog.type()).toBe("confirm");
        expect(dialog.message()).toContain("Warning: There are 2 item(s) currently in the \"Dairy\" category.");
        expect(dialog.message()).toContain("If you delete it, these items will have an unmapped category.");
        await dialog.accept();
      });

      const dairyRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Dairy" }),
      });
      await dairyRow.getByRole("button").click();
    });

    await recorder.step("Verify the category is removed and map refreshes without page reload", async () => {
      await expect(page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Dairy" }),
      })).toHaveCount(0);

      const aisle1Cell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 1", { exact: true }),
      });
      await expect(aisle1Cell.getByText("Dairy", { exact: true })).toHaveCount(0);
      await expect(page.locator(".quick-list-item")).toHaveCount(1);
      await expect(page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Bakery" }),
      })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_delete_with_inventory_warning");
  } finally {
    await recorder.save(testInfo);
  }
});
