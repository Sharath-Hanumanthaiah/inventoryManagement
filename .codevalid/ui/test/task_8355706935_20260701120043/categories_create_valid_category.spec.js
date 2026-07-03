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
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(categoryState),
      });
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
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(created),
      });
      return;
    }

    if (method === "DELETE" && /\/api\/categories\/[^/]+$/.test(pathname)) {
      const id = pathname.split("/").pop();
      categoryState = categoryState.filter((category) => category.id !== id);
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (method === "GET" && pathname.endsWith("/api/items")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(itemState),
      });
      return;
    }

    if (method === "GET" && pathname.endsWith("/api/orders")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

test("Create a valid category with all placement details", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_create_valid_category", "Create a valid category with all placement details");

  try {
    await recorder.step("Register mocked category and item APIs", async () => {
      await setupCategoryRoutes(page, { categories: [], items: [] });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Fill category name and description", async () => {
      await page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks").fill("Dairy");
      await page.locator("#cat-desc").fill("Refrigerated food items");
    });

    await recorder.step("Select store placement coordinates", async () => {
      await page.locator("#aisle-select").selectOption("Aisle 3");
      await page.locator("#section-select").selectOption("Section A");
      await page.locator("#shelf-select").selectOption("Shelf 1");
    });

    await recorder.step("Submit the category form", async () => {
      await page.getByRole("button", { name: "Create & Map Category", exact: true }).click();
    });

    await recorder.step("Verify category appears in list and visual map and form resets", async () => {
      const createdCategory = page.locator(".quick-list-item", {
        has: page.locator(".item-title", { hasText: "Dairy" }),
      });

      await expect(createdCategory).toBeVisible();
      await expect(createdCategory.getByText("Refrigerated food items", { exact: true })).toBeVisible();
      await expect(createdCategory.getByText("Aisle 3", { exact: true })).toBeVisible();
      await expect(createdCategory.getByText("Section A", { exact: true })).toBeVisible();
      await expect(createdCategory.getByText("Shelf 1", { exact: true })).toBeVisible();

      const aisle3Cell = page.locator(".placement-cell", {
        has: page.getByText("Aisle 3", { exact: true }),
      });
      await expect(aisle3Cell.getByText("Dairy", { exact: true })).toBeVisible();

      await expect(page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks")).toHaveValue("");
      await expect(page.locator("#cat-desc")).toHaveValue("");
      await expect(page.locator("#aisle-select")).toHaveValue("Aisle 1");
      await expect(page.locator("#section-select")).toHaveValue("Section A");
      await expect(page.locator("#shelf-select")).toHaveValue("Shelf 1");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_create_valid_category");
  } finally {
    await recorder.save(testInfo);
  }
});
