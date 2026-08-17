const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Yaris Akbar Rivaldi/.gemini/antigravity/brain/8a0ba5a0-b31a-4673-b37f-3605af6ef8ac/screenshots';

async function testUpdates() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log('=== RUNNING VERIFICATION FOR USER UPDATES ===');
  const browser = await chromium.launch();

  // --- TEST 1: WARGA ROLE ---
  console.log('\n>>> 1. TESTING WARGA ROLE <<<');
  const ctxW = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const pw = await ctxW.newPage();
  await pw.goto('http://localhost:3000');
  await pw.waitForLoadState('networkidle');
  await pw.click('button:has-text("Warga")');
  await pw.click('button:has-text("Masuk")');
  await pw.waitForTimeout(2000);

  // 1.1 MBG Privacy — no high-risk card for warga
  await pw.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Integrasi MBG') || x.textContent.includes('Program MBG'));
    if (b) b.click();
  });
  await pw.waitForTimeout(1500);
  await pw.screenshot({ path: path.join(SCREENSHOT_DIR, 'warga-mbg.png') });
  const hrCount = await pw.evaluate(() =>
    document.body.innerText.includes('Prioritas Penyaluran MBG') ? 1 : 0
  );
  console.log(`1.1 MBG High-Risk visible for Warga: ${hrCount === 0 ? '✅ HIDDEN (PASS)' : '❌ VISIBLE (FAIL)'}`);

  // 1.2 Seminar Presensi — only personal name
  await pw.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Seminar'));
    if (b) b.click();
  });
  await pw.waitForTimeout(1500);

  const presensiOpened = await pw.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Input Presensi'));
    if (b) { b.click(); return true; }
    return false;
  });
  if (presensiOpened) {
    await pw.waitForTimeout(1000);
    await pw.screenshot({ path: path.join(SCREENSHOT_DIR, 'warga-presensi.png') });

    const presensiCheck = await pw.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { hasSiti: false, hasDewi: false, hasSitiAminah: false };
      const text = dialog.innerText;
      return {
        hasSiti: text.includes('Siti Aisyah'),
        hasDewi: text.includes('Dewi Lestari'),
        hasSitiAminah: text.includes('Siti Aminah')
      };
    });
    console.log(`1.2 Presensi has "Siti Aisyah": ${presensiCheck.hasSiti ? '✅ YES' : '❌ NO'}`);
    console.log(`1.3 Presensi has "Dewi Lestari" (should be NO): ${presensiCheck.hasDewi ? '❌ YES (FAIL)' : '✅ NO (PASS)'}`);
    console.log(`1.4 Presensi has "Siti Aminah" (should be NO): ${presensiCheck.hasSitiAminah ? '❌ YES (FAIL)' : '✅ NO (PASS)'}`);

    // Close dialog
    await pw.keyboard.press('Escape');
    await pw.waitForTimeout(500);
  }

  // 1.3 Certificate download — check name in template
  await pw.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Selesai'));
    if (b) b.click();
  });
  await pw.waitForTimeout(1000);
  const certCheck = await pw.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Unduh Sertifikat'));
    if (b) { b.click(); return true; }
    return false;
  });
  if (certCheck) {
    await pw.waitForTimeout(2000);
    console.log('1.5 Certificate download triggered: ✅');
  }

  await ctxW.close();

  // --- TEST 2: MOBILE OVERFLOW ---
  console.log('\n>>> 2. TESTING MOBILE OVERFLOW <<<');
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

  const sections = ['Dashboard', 'Laporan', 'Program MBG', 'Seminar'];
  let overflowFails = 0;

  for (const sec of sections) {
    // Open mobile menu
    const menuBtn = pm.locator('[aria-label="Buka menu"]');
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await pm.waitForTimeout(800);
    }
    await pm.evaluate((label) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.includes(label));
      if (b) b.click();
    }, sec);
    await pm.waitForTimeout(1500);

    const ov = await pm.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth
    }));
    const hasOverflow = ov.sw > ov.iw;
    if (hasOverflow) overflowFails++;
    console.log(`2.${sections.indexOf(sec)+1} ${sec}: scrollWidth=${ov.sw}, innerWidth=${ov.iw} → ${hasOverflow ? '❌ OVERFLOW' : '✅ OK'}`);
    await pm.screenshot({ path: path.join(SCREENSHOT_DIR, `mobile-${sec.toLowerCase().replace(/ /g,'-')}.png`) });
  }

  await ctxM.close();

  // --- TEST 3: ADMIN PRESENSI (full list) ---
  console.log('\n>>> 3. TESTING ADMIN PRESENSI (full participant list) <<<');
  const ctxA = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const pa = await ctxA.newPage();
  await pa.goto('http://localhost:3000');
  await pa.waitForLoadState('networkidle');
  await pa.click('button:has-text("Admin")');
  await pa.click('button:has-text("Masuk")');
  await pa.waitForTimeout(2000);

  await pa.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Seminar'));
    if (b) b.click();
  });
  await pa.waitForTimeout(1500);

  const adminPresensiOpened = await pa.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Input Presensi'));
    if (b) { b.click(); return true; }
    return false;
  });
  if (adminPresensiOpened) {
    await pa.waitForTimeout(1000);
    const adminCheck = await pa.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { hasDewi: false, hasSitiAminah: false, count: 0 };
      const text = dialog.innerText;
      const rows = dialog.querySelectorAll('tbody tr');
      return {
        hasDewi: text.includes('Dewi Lestari'),
        hasSitiAminah: text.includes('Siti Aminah'),
        count: rows.length
      };
    });
    console.log(`3.1 Admin sees full list (${adminCheck.count} rows): ${adminCheck.count >= 4 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`3.2 Admin sees "Dewi Lestari": ${adminCheck.hasDewi ? '✅ YES' : '❌ NO'}`);
    await pa.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-presensi-full.png') });
  }

  await ctxA.close();
  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log(`Mobile overflow fails: ${overflowFails}/${sections.length}`);
  console.log('=== VERIFICATION COMPLETE ===');
}

testUpdates().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
