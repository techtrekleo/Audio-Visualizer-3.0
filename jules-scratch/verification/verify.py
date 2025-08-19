from playwright.sync_api import sync_playwright, expect, Dialog

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Go to the local dev server
            page.goto("http://localhost:5173", timeout=30000)

            # --- Test 1: Reversed Monstercat ---
            vis_select = page.locator("#vis-select")
            expect(vis_select).to_be_visible(timeout=20000)
            page.select_option("#vis-select", value="Monstercat")
            page.wait_for_timeout(1000)
            visualizer_element = page.locator(".relative.shadow-2xl")
            visualizer_element.screenshot(path="jules-scratch/verification/monstercat_reversed.png")
            print("Screenshot saved for reversed Monstercat.")

            # --- Test 2: Reduced CRT Glitch ---
            page.select_option("#vis-select", value="CRT Glitch")
            page.wait_for_timeout(1000)
            visualizer_element.screenshot(path="jules-scratch/verification/crt_glitch_reduced.png")
            print("Screenshot saved for reduced CRT Glitch.")

            # --- Test 3: Subtitle Validation ---
            alert_triggered = False

            def handle_dialog(dialog: Dialog):
                nonlocal alert_triggered
                alert_triggered = True
                print(f"Alert dialog opened: {dialog.message}")
                expect(dialog.message).to_contain("字幕格式不正確")
                dialog.dismiss()

            page.on("dialog", handle_dialog)

            subtitle_textarea = page.locator("#subtitle-text")
            expect(subtitle_textarea).to_be_visible(timeout=10000)

            # Use fill to trigger the change event
            subtitle_textarea.fill("this is not a valid format")

            # Wait a moment for the alert to trigger
            page.wait_for_timeout(1000)

            if alert_triggered:
                print("SUCCESS: Subtitle validation alert was triggered correctly.")
            else:
                print("FAILURE: Subtitle validation alert was NOT triggered.")
                # Take a screenshot for debugging if the alert fails
                page.screenshot(path="jules-scratch/verification/subtitle_alert_fail.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
            content = page.content()
            print("\nPage Content:\n", content)

        finally:
            browser.close()

run_verification()
