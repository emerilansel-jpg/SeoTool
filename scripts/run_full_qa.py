import time
import os
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:3101"

def full_live_qa():
    print("=" * 60)
    print("🚀 RUNNING COMPREHENSIVE LIVE QA (EXACT USER FEEDBACK)")
    print("=" * 60)

    scorecard = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 950},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
        )
        context.add_init_script("window.__E2E_BYPASS_AUTH = true;")
        page = context.new_page()

        # -------------------------------------------------------------
        # SUITE 1: HOMEPAGE HERO & 3 EXTRA POWERS
        # -------------------------------------------------------------
        print("\n[SUITE 1] Testing Homepage Hero & 3 Extra Powers...")
        page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1.5)

        h1_text = page.locator("h1").inner_text()
        print(f" -> H1 Text: '{h1_text}'")
        scorecard["1_Hero_Headline"] = "Everything You Expect From an SEO Tool, Plus 3 Extra Powers" in h1_text

        sub_text = page.locator("text=Connect via MCP to Codex, Cursor, or any AI agent. Use BYOK, or start at $1/month.")
        scorecard["1b_Hero_Subtitle_MCP_BYOK"] = sub_text.is_visible()

        p1_fast = page.locator("text=Rank faster")
        p1_kgr = page.locator("text=Smarter keyword research")
        p2_local = page.locator("text=Rank locally")
        p2_maps = page.locator("text=Local SEO tracking")
        p3_ai = page.locator("text=Rank in AI")
        p3_geo = page.locator("text=GEO tracking")

        scorecard["1c_Power1_RankFaster"] = p1_fast.is_visible() and p1_kgr.is_visible()
        scorecard["1d_Power2_RankLocally"] = p2_local.is_visible() and p2_maps.is_visible()
        scorecard["1e_Power3_RankInAI"] = p3_ai.is_visible() and p3_geo.is_visible()

        page.screenshot(path="qa_evidence_1_homepage_hero.png")
        page.evaluate("window.scrollBy(0, 850)")
        time.sleep(1)
        page.screenshot(path="qa_evidence_1b_homepage_powers.png")
        print("  ✓ Saved qa_evidence_1_homepage_hero.png & qa_evidence_1b_homepage_powers.png")

        # -------------------------------------------------------------
        # SUITE 2: PRICING REDESIGN ($27 LTD & MONTHLY VOLUME DISCOUNT)
        # -------------------------------------------------------------
        print("\n[SUITE 2] Testing Pricing Redesign...")
        page.goto(f"{BASE_URL}/pricing", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1.5)

        # Tab Appsumo check
        appsumo = page.locator("button:has-text('AppSumo')")
        scorecard["2_AppSumo_Tab_Hidden"] = not appsumo.is_visible()

        # LTD $27 flat check
        ltd_tab = page.locator("button:has-text('Early Believer LTD ($27 Once)')")
        scorecard["2b_LTD_Tab_27"] = ltd_tab.is_visible()

        price_27 = page.locator("div:has-text('$27')").first
        scorecard["2c_Price_27_Displayed"] = price_27.is_visible()

        # Confusing $39-$59 hidden
        bad_39 = page.locator("text=Early 20 ($39)")
        bad_59 = page.locator("text=Public ($59)")
        scorecard["2d_Confusing_Tiers_Hidden"] = not bad_39.is_visible() and not bad_59.is_visible()

        page.screenshot(path="qa_evidence_2_pricing_ltd.png")

        # Monthly Volume Discount Check
        page.locator("button:has-text('Monthly Packs')").click()
        time.sleep(1.5)
        d21 = page.locator("text=+21% volume bonus")
        d29 = page.locator("text=+29% volume bonus")
        d48 = page.locator("text=+48% volume bonus")
        d62 = page.locator("text=+62% volume bonus")
        scorecard["2e_Monthly_Volume_Discounts"] = d21.is_visible() and d29.is_visible() and d48.is_visible() and d62.is_visible()

        page.screenshot(path="qa_evidence_2b_pricing_monthly.png")
        print("  ✓ Saved qa_evidence_2_pricing_ltd.png & qa_evidence_2b_pricing_monthly.png")

        # -------------------------------------------------------------
        # SUITE 3: AUTO-PREFIX https:// ON INPUTS
        # -------------------------------------------------------------
        print("\n[SUITE 3] Testing Auto-prefix https:// across inputs...")
        page.goto(f"{BASE_URL}/p/00000000-0000-4000-8000-000000000001/audit", wait_until="domcontentloaded")
        page.wait_for_selector("input[placeholder*='example.com']", timeout=15000)
        time.sleep(1)

        domain_input = page.locator("input[placeholder*='example.com']").first
        domain_input.fill("unprefixed-user-site.com")
        page.keyboard.press("Tab") # blur
        time.sleep(1)
        val = domain_input.input_value()
        scorecard["3_Auto_Prefix_HTTPS"] = val == "https://unprefixed-user-site.com"

        page.screenshot(path="qa_evidence_3_auto_https.png")
        print(f"  ✓ Value after blur: '{val}' -> Saved qa_evidence_3_auto_https.png")

        # -------------------------------------------------------------
        # SUITE 4: WHITE-LABELING (SETTINGS & DASHBOARD)
        # -------------------------------------------------------------
        print("\n[SUITE 4] Testing White-Labeling (No DataForSEO/OpenSEO in UI)...")
        page.goto(f"{BASE_URL}/settings", wait_until="domcontentloaded")
        page.wait_for_selector("text=Search Engine API", timeout=15000)
        time.sleep(1)

        settings_text = page.locator("body").inner_text()
        scorecard["4_Zero_DataForSEO_Leak"] = "dataforseo" not in settings_text.lower()
        scorecard["4b_Zero_OpenSEO_Leak"] = "openseo" not in settings_text.lower()
        scorecard["4c_Generic_Search_Engine_API"] = page.locator("text=Search Engine API").is_visible()

        page.screenshot(path="qa_evidence_4_whitelabel_settings.png")
        print("  ✓ Saved qa_evidence_4_whitelabel_settings.png")

        # -------------------------------------------------------------
        # SUITE 5: AI POLISHING & CLEANING GAP KEYWORDS
        # -------------------------------------------------------------
        print("\n[SUITE 5] Testing AI Polishing & Noise Cleaning (Content Gap)...")
        page.goto(f"{BASE_URL}/p/00000000-0000-4000-8000-000000000001/content-gap", wait_until="domcontentloaded")
        time.sleep(2)

        page.locator("input[placeholder*='Enter your domain']").first.fill("mystore.com")
        page.locator("input[placeholder*='Competitors']").first.fill("shopify.com, woocommerce.com")
        page.locator("button:has-text('Search')").first.click()
        page.wait_for_timeout(3000)

        polish_btn = page.locator("button:has-text('AI Polish & Clean Noise')")
        scorecard["5_AI_Polish_Button_Visible"] = polish_btn.is_visible()
        
        # White label indicator
        api_cost_label = page.locator("text=Costs Search API credits")
        scorecard["5b_Whitelabel_Search_API_Indicator"] = api_cost_label.is_visible()

        rows_before = page.locator("table tbody tr").count()
        print(f" -> Keywords count before polish: {rows_before}")
        page.screenshot(path="qa_evidence_5a_gap_raw_keywords.png")

        polish_btn.click()
        page.wait_for_timeout(2000)

        rows_after = page.locator("table tbody tr").count()
        print(f" -> Keywords count after polish: {rows_after}")
        badge = page.locator("text=AI Polished & Cleaned")
        scorecard["5c_AI_Polish_Executed_Noise_Removed"] = (rows_after < rows_before) and badge.is_visible()

        page.screenshot(path="qa_evidence_5b_gap_polished_keywords.png")
        print("  ✓ Saved qa_evidence_5a_gap_raw_keywords.png & qa_evidence_5b_gap_polished_keywords.png")

        # -------------------------------------------------------------
        # SUITE 6: STREAMLINED AI TRACKING UI (4 PILLARS)
        # -------------------------------------------------------------
        print("\n[SUITE 6] Testing Streamlined AI Tracking UI (4 Pillars)...")
        page.goto(f"{BASE_URL}/projects", wait_until="domcontentloaded")
        page.wait_for_selector("a[href^='/p/']", timeout=15000)
        time.sleep(1)
        project_link = page.locator("a[href^='/p/']:visible").first
        href = project_link.get_attribute("href")
        proj_id = href.split("/")[2] if href else "00000000-0000-4000-8000-000000000001"

        page.goto(f"{BASE_URL}/p/{proj_id}/ai-tracking", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1.5)

        setup_btn = page.locator("button:has-text('Configure Generative AI'), button:has-text('Configure AI Generatif'), button:has-text('Setup Tracking')").first
        if setup_btn.is_visible():
            print(" -> Configuring brand for AI Tracking...")
            setup_btn.click()
            time.sleep(1)
            page.locator("input[placeholder*='Zoho']").first.fill("Acme Digital")
            page.locator("input[placeholder*='zoho.com']").first.fill("acmedigital.com")
            page.locator("button:has-text('Save Configuration')").click()
            time.sleep(2)

        import re
        tab_overview = page.get_by_role("button", name=re.compile(r"Overview & Mentions")).first
        tab_prompts = page.get_by_role("button", name=re.compile(r"Actionable Prompts")).first
        tab_sources = page.get_by_role("button", name=re.compile(r"Sources & Citations")).first
        tab_competitors = page.get_by_role("button", name=re.compile(r"Competitor Overlap")).first

        scorecard["6a_Pillar1_Overview_Mentions"] = tab_overview.is_visible()
        scorecard["6b_Pillar2_Actionable_Prompts"] = tab_prompts.is_visible()
        scorecard["6c_Pillar3_Sources_Citations"] = tab_sources.is_visible()
        scorecard["6d_Pillar4_Competitor_Overlap"] = tab_competitors.is_visible()

        page.screenshot(path="qa_evidence_6_ai_tracking_4_pillars.png")

        # Click into Pillar 2 (Actionable Prompts)
        if tab_prompts.is_visible():
            tab_prompts.click()
            time.sleep(1.5)
            page.screenshot(path="qa_evidence_6b_ai_tracking_prompts.png")
            print("  ✓ Saved qa_evidence_6_ai_tracking_4_pillars.png & qa_evidence_6b_ai_tracking_prompts.png")

        browser.close()

    print("\n" + "=" * 60)
    print("🎯 FINAL QA SCORECARD - ALL USER FEEDBACK ITEMS")
    print("=" * 60)
    all_ok = True
    for item, passed in scorecard.items():
        status = "PASSED" if passed else "FAILED"
        print(f"[{status}] {item}")
        if not passed:
            all_ok = False

    print("=" * 60)
    print(f"OVERALL STATUS: {'100% PERFECT PASS' if all_ok else 'SOME FAILED'}")
    print("=" * 60)

if __name__ == "__main__":
    full_live_qa()
