import { test, expect } from "@playwright/test";
import { ExecutionRecorder } from "../../helpers/execution-recorder.js";
import { setupInventoryAppMocks, mockHomePageApis } from "../../helpers/mock-api.js";

async function setupCategoryRoutes(page) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    const method = request.method();

    if (method === "GET" && pathname.endsWith("/api/categories")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      return;
    }

    if (method === "GET" && pathname.endsWith("/api/items")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      return;
    }

    if (method === "GET" && pathname.endsWith("/api/orders")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
}

test("Categories page shows empty state when no categories exist", async ({ page }, testInfo) => {
  const recorder = new ExecutionRecorder("categories_empty_state_no_categories", "Categories page shows empty state when no categories exist");

  try {
    await recorder.step("Register empty category mocks", async () => {
      await setupCategoryRoutes(page);
    });

    await recorder.step("Navigate to the categories page", async () => {
      await page.goto("/categories");
      await expect(page.getByRole("heading", { name: "Categories & Layout", exact: true })).toBeVisible();
    });

    await recorder.step("Verify categories list empty state is shown", async () => {
      await expect(page.getByText("No categories registered", { exact: true })).toBeVisible();
      await expect(page.getByText("Create your first category in the form to begin mapping items in the store.", { exact: true })).toBeVisible();
    });

    await recorder.step("Verify visual aisle layout empty state and create form are accessible", async () => {
      await expect(page.getByText("No Aisle Maps Available", { exact: true })).toBeVisible();
      await expect(page.getByText("Aisles will populate once categories are created and mapped.", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Create Category", exact: true })).toBeVisible();
      await expect(page.getByPlaceholder("e.g. Fresh Produce, Canned, Snacks")).toBeVisible();
      await expect(page.getByRole("button", { name: "Create & Map Category", exact: true })).toBeVisible();
    });

    console.log("CODEVALID_TEST_ASSERTION_OK:categories_empty_state_no_categories");
  } finally {
    await recorder.save(testInfo);
  }
});
