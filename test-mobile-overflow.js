const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Yaris Akbar Rivaldi/.gemini/antigravity/brain/8a0ba5a0-b31a-4673-b37f-3605af6ef8ac/screenshots';

async function testMobileOverflow() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log('=== MOBILE OVERFLOW TEST ===');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Admin")');
  await page.click('button:has-text("Masuk")');
  await page.waitForTimeout(2000);

  const sections = ['Dashboard', 'Laporan', 'Program MBG', 'Seminar', 'KISB Digital', 'Peta Risiko'];
  let overflowFails = 0;

  for (const sec of sections) {
    // Use evaluate to navigate — avoids Sheet intercept issues
    await page.evaluate((label) => {
      // Close any open sheets/dialogs first
      document.querySelectorAll('[data-state="open"][role="dialog"]').forEach(el => {
        const closeBtn = el.querySelector('button[data-slot="sheet-close"], button[aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      });
      // Click the nav button by finding it in the DOM
      setTimeout(() => {
        const btns = Array.from(document.querySelectorAll('button, nav button'));
        const b = btns.find(x => x.textContent.trim().includes(label));
        if (b) b.click();
      }, 300);
    }, sec);
    await page.waitForTimeout(2000);

    // Close sheet overlay if still visible
    await page.evaluate(() => {
      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      if (overlay) overlay.click();
    });
    await page.waitForTimeout(500);

    const ov = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth
    }));
    const hasOverflow = ov.sw > ov.iw;
    if (hasOverflow) overflowFails++;
    console.log(`${sec}: scrollWidth=${ov.sw}, innerWidth=${ov.iw} → ${hasOverflow ? '❌ OVERFLOW' : '✅ OK'}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `mobile-${sec.toLowerCase().replace(/ /g, '-')}.png`) });
  }

  await ctx.close();
  await browser.close();

  console.log(`\n=== RESULT: ${overflowFails}/${sections.length} sections with overflow ===`);
  if (overflowFails === 0) console.log('🎉 ALL SECTIONS PASS — NO HORIZONTAL OVERFLOW!');
  process.exit(overflowFails > 0 ? 1 : 0);
}

testMobileOverflow().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
