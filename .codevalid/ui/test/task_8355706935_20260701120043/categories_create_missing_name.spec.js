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

test("Form rejects category creation with missing name", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_create_missing_name", "Form rejects category creation with missing name");

  try {
    await recorder.step("Register empty categories mocks", async () => {
      await setupCategoryRoutes(page, { categories: [], items: [] });
    });

    await recorder.step("Open categories page", async () => {
      await page.goto("/categories");
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Fill description and placement but leave name empty", async () => {
      await page.locator("#cat-desc").fill("Refrigerated food items");
      await page.locator("#aisle-select").selectOption("Aisle 3");
      await page.locator("#section-select").selectOption("Section A");
      await page.locator("#shelf-select").selectOption("Shelf 1");
    });

    await recorder.step("Attempt to submit and verify browser validation blocks submit", async () => {
      await page.getByRole("button", { name: "Create & Map Category", exact: true }).click();
      await expect(page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks")).toBeFocused();
      const validity = await page.locator("#cat-name").evaluate((input) => input.validationMessage);
      expect(validity.length).toBeGreaterThan(0);
    });

    await recorder.step("Verify no category was added to list or map", async () => {
      await expect(page.getByText("No categories registered", { exact: true })).toBeVisible();
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toBeVisible();
      await expect(page.locator(".quick-list-item")).toHaveCount(0);
      await expect(page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks")).toHaveValue("");
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_create_missing_name");
  } finally {
    await recorder.save(testInfo);
  }
});
