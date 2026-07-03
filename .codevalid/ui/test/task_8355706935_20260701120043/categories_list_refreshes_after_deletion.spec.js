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

test("Categories list refreshes immediately after successful deletion", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_list_refreshes_after_deletion", "Categories list refreshes immediately after successful deletion");

  try {
    await recorder.step("Register categories fixture with multiple rows", async () => {
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
          {
            id: "cat-promotional",
            name: "Promotional",
            description: "Seasonal promotions",
            aisle: "Aisle 4",
            section: "Section D",
            shelf: "Shelf 4",
          },
        ],
        items: [
          {
            id: "item-milk",
            name: "Milk",
            category: "Dairy",
            quantity: 6,
            state: "liquid",
            expiryDate: "2024-07-10",
            lastStockIn: "2024-06-01",
            salesTrend: [1, 2, 3, 4, 5, 6],
            seasonalSales: { summer: 10, monsoon: 8, winter: 9, spring: 7 },
          },
        ],
      });
    });

    await recorder.step("Open categories page and note initial list count", async () => {
      await page.goto("/categories");
      await expect(page.locator(".quick-list-item")).toHaveCount(3);
      await expect(page.getByText("Configured Categories (3)", { exact: true })).toBeVisible();
    });

    await recorder.step("Delete a category and confirm removal", async () => {
      page.once("dialog", async (dialog) => {
        expect(dialog.type()).toBe("confirm");
        expect(dialog.message()).toBe('Are you sure you want to delete the "Promotional" category?');
        await dialog.accept();
      });

      const promotionalRow = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Promotional" }),
      });
      await promotionalRow.getByRole("button").click();
    });

    await recorder.step("Verify list and map refresh immediately without reload", async () => {
      await expect(page.locator(".quick-list-item")).toHaveCount(2);
      await expect(page.getByText("Configured Categories (2)", { exact: true })).toBeVisible();
      await expect(page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Promotional" }),
      })).toHaveCount(0);

      const aisle4Cell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 4", { exact: true }),
      });
      await expect(aisle4Cell.getByText("Promotional", { exact: true })).toHaveCount(0);
      await expect(page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Dairy" }),
      })).toBeVisible();
      await expect(page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Bakery" }),
      })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_list_refreshes_after_deletion");
  } finally {
    await recorder.save(testInfo);
  }
});
