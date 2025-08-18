from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Go to the local dev server
            # The default port for Vite is 5173
            page.goto("http://localhost:5173", timeout=20000)

            # Wait for the controls to be visible
            vis_select = page.locator("#vis-select")
            expect(vis_select).to_be_visible(timeout=15000)

            # Select the "唱片機" visualization
            # Using the value which is the enum's text content
            page.select_option("#vis-select", value="唱片機")

            # Wait a moment for the animation to be visible
            page.wait_for_timeout(2000)

            # Take a screenshot of the visualizer area
            visualizer_element = page.locator(".relative.shadow-2xl")
            expect(visualizer_element).to_be_visible(timeout=10000)
            visualizer_element.screenshot(path="jules-scratch/verification/screenshot.png")

            print("Screenshot saved to jules-scratch/verification/screenshot.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Try to get a screenshot even if something failed
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
            # Print page content for debugging
            content = page.content()
            print("\nPage Content:\n", content)

        finally:
            browser.close()

run_verification()
