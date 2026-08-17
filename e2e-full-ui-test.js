const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SS = 'C:/Users/Yaris Akbar Rivaldi/.gemini/antigravity/brain/8a0ba5a0-b31a-4673-b37f-3605af6ef8ac/screenshots';

const SECTIONS = [
  { label: 'Dashboard', nav: 'Dashboard' },
  { label: 'KISB Digital', nav: 'KISB Digital' },
  { label: 'Jadwal Posyandu', nav: 'Jadwal Posyandu' },
  { label: 'Edukasi Gizi', nav: 'Edukasi Gizi' },
  { label: 'Seminar Gizi', nav: 'Seminar' },
  { label: 'Integrasi MBG', nav: 'Integrasi MBG' },
  { label: 'Laporan', nav: 'Laporan' },
  { label: 'Peta Risiko', nav: 'Peta Risiko' },
  { label: 'Pengaturan', nav: 'Pengaturan' },
];

async function navigateViaJS(page, navLabel) {
  // Close any open dialogs/sheets first
  await page.evaluate(() => {
    document.querySelectorAll('[data-state="open"][role="dialog"]').forEach(el => {
      const cb = el.querySelector('button[data-slot="sheet-close"], button[aria-label="Close"]');
      if (cb) cb.click();
    });
    const ov = document.querySelector('[data-slot="sheet-overlay"]');
    if (ov) ov.click();
  });
  await page.waitForTimeout(300);

  await page.evaluate((label) => {
    const btns = Array.from(document.querySelectorAll('button, nav button, aside button'));
    const b = btns.find(x => x.textContent.trim() === label || x.textContent.includes(label));
    if (b) b.click();
  }, navLabel);
  await page.waitForTimeout(1500);
}

async function run() {
  if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch();
  const issues = [];

  // ============================
  // DESKTOP TEST (1280x850)
  // ============================
  console.log('=== DESKTOP TEST (1280x850) ===\n');
  const ctxD = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const pd = await ctxD.newPage();
  await pd.goto('http://localhost:3000');
  await pd.waitForLoadState('networkidle');
  await pd.click('button:has-text("Admin")');
  await pd.click('button:has-text("Masuk")');
  await pd.waitForTimeout(2000);

  for (const sec of SECTIONS) {
    await navigateViaJS(pd, sec.nav);
    const fname = `desktop-${sec.label.toLowerCase().replace(/ /g, '-')}.png`;
    await pd.screenshot({ path: path.join(SS, fname), fullPage: true });

    const info = await pd.evaluate(() => {
      const sw = document.documentElement.scrollWidth;
      const iw = window.innerWidth;
      // Check for elements that extend beyond viewport
      const overflowElements = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > iw + 5 && r.width > 10) {
          overflowElements.push({
            tag: el.tagName,
            class: el.className?.toString().substring(0, 60),
            right: Math.round(r.right),
          });
        }
      });
      return { sw, iw, overflowCount: overflowElements.length, topOverflows: overflowElements.slice(0, 3) };
    });

    const ok = info.sw <= info.iw;
    console.log(`[Desktop] ${sec.label}: scrollW=${info.sw} innerW=${info.iw} → ${ok ? '✅ OK' : '❌ OVERFLOW'}`);
    if (!ok) {
      issues.push({ viewport: 'Desktop', section: sec.label, sw: info.sw, iw: info.iw, overflows: info.topOverflows });
      console.log(`  Overflowing elements:`, JSON.stringify(info.topOverflows));
    }
  }
  await ctxD.close();

  // ============================
  // MOBILE TEST (375x812)
  // ============================
  console.log('\n=== MOBILE TEST (375x812) ===\n');
  const ctxM = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
  });
  const pm = await ctxM.newPage();
  await pm.goto('http://localhost:3000');
  await pm.waitForLoadState('networkidle');
  await pm.click('button:has-text("Admin")');
  await pm.click('button:has-text("Masuk")');
  await pm.waitForTimeout(2000);

  for (const sec of SECTIONS) {
    await navigateViaJS(pm, sec.nav);
    const fname = `mobile-${sec.label.toLowerCase().replace(/ /g, '-')}.png`;
    await pm.screenshot({ path: path.join(SS, fname), fullPage: true });

    const info = await pm.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth
    }));

    const ok = info.sw <= info.iw;
    console.log(`[Mobile] ${sec.label}: scrollW=${info.sw} innerW=${info.iw} → ${ok ? '✅ OK' : '❌ OVERFLOW'}`);
    if (!ok) {
      issues.push({ viewport: 'Mobile', section: sec.label, sw: info.sw, iw: info.iw });
    }
  }
  await ctxM.close();

  // ============================
  // TABLET TEST (768x1024)
  // ============================
  console.log('\n=== TABLET TEST (768x1024) ===\n');
  const ctxT = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const pt = await ctxT.newPage();
  await pt.goto('http://localhost:3000');
  await pt.waitForLoadState('networkidle');
  await pt.click('button:has-text("Admin")');
  await pt.click('button:has-text("Masuk")');
  await pt.waitForTimeout(2000);

  for (const sec of SECTIONS) {
    await navigateViaJS(pt, sec.nav);
    const info = await pt.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth
    }));
    const ok = info.sw <= info.iw;
    console.log(`[Tablet] ${sec.label}: scrollW=${info.sw} innerW=${info.iw} → ${ok ? '✅ OK' : '❌ OVERFLOW'}`);
    if (!ok) issues.push({ viewport: 'Tablet', section: sec.label, sw: info.sw, iw: info.iw });
  }
  await ctxT.close();

  await browser.close();

  // ============================
  // SUMMARY
  // ============================
  console.log('\n==========================================');
  console.log('FINAL SUMMARY');
  console.log('==========================================');
  console.log(`Total issues found: ${issues.length}`);
  if (issues.length === 0) {
    console.log('🎉 ALL VIEWPORTS & ALL SECTIONS PASS — NO UI OVERFLOW ISSUES!');
  } else {
    console.log('\nIssues:');
    issues.forEach((i, idx) => {
      console.log(`  ${idx + 1}. [${i.viewport}] ${i.section}: scrollWidth=${i.sw} > innerWidth=${i.iw}`);
    });
  }
  process.exit(issues.length > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
