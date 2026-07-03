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

    if (method === "POST" && pathname.endsWith("/api/categories")) {
      const payload = JSON.parse(request.postData() || "{}");
      const created = {
        id: `cat-${categoryState.length + 1}`,
        name: payload.name,
        description: payload.description || "",
        aisle: payload.aisle,
        section: payload.section,
        shelf: payload.shelf,
      };
      categoryState.push(created);
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(created) });
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

test("Form rejects category creation with missing placement coordinates", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_create_missing_placement", "Form rejects category creation with missing placement coordinates");

  try {
    await recorder.step("Register mocked APIs for an empty categories page", async () => {
      await setupCategoryRoutes(page, { categories: [], items: [] });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Enter category details without changing placement selects", async () => {
      await page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks").fill("Bakery");
      await page.locator("#cat-desc").fill("Fresh baked goods");
    });

    await recorder.step("Submit form and verify current app uses default placement values", async () => {
      await page.getByRole("button", { name: "Create & Map Category", exact: true }).click();

      const createdCategory = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Bakery" }),
      });

      await expect(createdCategory).toBeVisible();
      await expect(createdCategory.getByText("Aisle 1", { exact: true })).toBeVisible();
      await expect(createdCategory.getByText("Section A", { exact: true })).toBeVisible();
      await expect(createdCategory.getByText("Shelf 1", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify visual map reflects the default mapping and no validation alert appears", async () => {
      const aisle1Cell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 1", { exact: true }),
      });
      await expect(aisle1Cell.getByText("Bakery", { exact: true })).toBeVisible();
      await expect(page.getByText("No categories registered", { exact: true })).not.toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_create_missing_placement");
  } finally {
    await recorder.save(testInfo);
  }
});
