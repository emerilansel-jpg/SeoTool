import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:3101"

def test_https_auto_prefix():
    print("=" * 60)
    print("🚀 TESTING AUTO-PREFIX & UNPREFIXED INPUT (ON-PAGE, SITEMAP, AUDIT)")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        context.add_init_script("window.__E2E_BYPASS_AUTH = true;")
        page = context.new_page()

        # ------------------------------------------------------------------
        # TEST 1: ON-PAGE SEO (WITHOUT https://)
        # ------------------------------------------------------------------
        print("\n[TEST 1] Testing On-Page SEO input WITHOUT https://...")
        page.goto(f"{BASE_URL}/p/00000000-0000-4000-8000-000000000001/on-page-checker", wait_until="domcontentloaded")
        page.wait_for_selector("input[placeholder*='example.com']", timeout=15000)
        time.sleep(1)

        input_field = page.locator("input[placeholder*='example.com']").first
        input_field.fill("seotool.im")
        
        # Test 1A: Blur event triggers auto-prefix
        page.keyboard.press("Tab")
        time.sleep(0.5)
        val_after_blur = input_field.input_value()
        print(f" -> Value after blur: '{val_after_blur}'")
        assert val_after_blur == "https://seotool.im", f"Expected https://seotool.im, got {val_after_blur}"
        print(" -> Auto-prefix on blur: SUCCESS")

        # Test 1B: Clear and submit WITHOUT blur (direct typing and enter/click)
        input_field.fill("seotool.im/features")
        analyze_btn = page.locator("button:has-text('Analyze')")
        analyze_btn.click()
        time.sleep(1)
        val_after_submit = input_field.input_value()
        print(f" -> Value after clicking Analyze directly: '{val_after_submit}'")
        assert val_after_submit == "https://seotool.im/features", f"Expected https://seotool.im/features, got {val_after_submit}"
        print(" -> Direct submit without https:// handled: SUCCESS")

        page.screenshot(path="qa_test_onpage_auto_https.png")

        # ------------------------------------------------------------------
        # TEST 2: SITEMAP VALIDATOR (WITHOUT https://)
        # ------------------------------------------------------------------
        print("\n[TEST 2] Testing Sitemap Validator input WITHOUT https://...")
        page.goto(f"{BASE_URL}/p/00000000-0000-4000-8000-000000000001/sitemap-validator", wait_until="domcontentloaded")
        page.wait_for_selector("input[placeholder*='example.com']", timeout=15000)
        time.sleep(1)

        sitemap_input = page.locator("input[placeholder*='example.com']").first
        sitemap_input.fill("seotool.im")
        
        # Test 2A: Blur event
        page.keyboard.press("Tab")
        time.sleep(0.5)
        val_sitemap_blur = sitemap_input.input_value()
        print(f" -> Value after blur: '{val_sitemap_blur}'")
        assert val_sitemap_blur == "https://seotool.im", f"Expected https://seotool.im, got {val_sitemap_blur}"
        print(" -> Sitemap auto-prefix on blur: SUCCESS")

        # Test 2B: Direct submit
        sitemap_input.fill("seotool.im/sitemap.xml")
        val_sitemap_submit = sitemap_input.input_value()
        val_sitemap_btn = page.locator("button:has-text('Validate')")
        val_sitemap_btn.click()
        time.sleep(1)
        val_after_sitemap_submit = sitemap_input.input_value()
        print(f" -> Value after clicking Validate directly: '{val_after_sitemap_submit}'")
        assert val_after_sitemap_submit == "https://seotool.im/sitemap.xml", f"Expected https://seotool.im/sitemap.xml, got {val_after_sitemap_submit}"
        print(" -> Sitemap direct submit without https:// handled: SUCCESS")

        page.screenshot(path="qa_test_sitemap_auto_https.png")

        # ------------------------------------------------------------------
        # TEST 3: SITE AUDIT (WITHOUT https://)
        # ------------------------------------------------------------------
        print("\n[TEST 3] Testing Site Audit input WITHOUT https://...")
        page.goto(f"{BASE_URL}/p/00000000-0000-4000-8000-000000000001/audit", wait_until="domcontentloaded")
        page.wait_for_selector("input[placeholder*='example.com']", timeout=15000)
        time.sleep(1)

        audit_input = page.locator("input[placeholder*='example.com']").first
        audit_input.fill("myunprefixedsite.com")
        page.keyboard.press("Tab")
        time.sleep(0.5)
        val_audit_blur = audit_input.input_value()
        print(f" -> Audit value after blur: '{val_audit_blur}'")
        assert val_audit_blur == "https://myunprefixedsite.com"
        print(" -> Audit auto-prefix on blur: SUCCESS")

        page.screenshot(path="qa_test_audit_auto_https.png")

        browser.close()

    print("\n" + "=" * 60)
    print("🎉 ALL AUTO-HTTPS TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_https_auto_prefix()
