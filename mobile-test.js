const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Yaris Akbar Rivaldi/.gemini/antigravity/brain/8a0ba5a0-b31a-4673-b37f-3605af6ef8ac/screenshots/';

(async () => {
  // Ensure the directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)){
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  const SECTIONS = [
    'dashboard', 'data-balita', 'kisb', 'jadwal', 'edukasi', 
    'seminar', 'mbg', 'laporan', 'peta-risiko', 'pengaturan'
  ];

  await page.goto('http://localhost:3000');
  
  // Wait for initial load
  await page.waitForTimeout(3000);

  let hasOverflow = false;

  for (const section of SECTIONS) {
    console.log(`Testing section: ${section}...`);
    
    // Open menu
    await page.click('[aria-label="Buka menu"]');
    await page.waitForTimeout(1000);
    
    // Find the button inside the sheet that switches to the section. 
    // We can just rely on clicking the first matching text or icon if needed.
    // However, wait, not all sections have a straightforward text, let's just use 
    // evaluate to find the button that has a specific ID or text, or we can use evaluate to hook into zustand.
    
    // Let's use Playwright to evaluate the click on the nav item that corresponds to the section.
    // The nav items have an onClick that sets the section. We can find the button by its label.
    // We know the group items from nav-data.
    const labelMap = {
      'dashboard': 'Dashboard',
      'data-balita': 'Data Balita',
      'detail-balita': 'Detail Balita',
      'kisb': 'KISB Digital',
      'jadwal': 'Jadwal Posyandu',
      'edukasi': 'Edukasi Gizi',
      'seminar': 'Seminar',
      'mbg': 'Program MBG',
      'laporan': 'Laporan',
      'peta-risiko': 'Peta Risiko',
      'pengaturan': 'Pengaturan'
    };
    
    const label = labelMap[section];
    if (label) {
      await page.evaluate((l) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes(l));
        if (btn) btn.click();
      }, label);
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${section}.png`), fullPage: false });
    
    // Check for horizontal overflow
    const overflowInfo = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
    
    console.log(`[${section}] scrollWidth: ${overflowInfo.scrollWidth}, innerWidth: ${overflowInfo.innerWidth}`);
    
    if (overflowInfo.scrollWidth > overflowInfo.innerWidth) {
      console.error(`❌ Overflow detected in ${section}! scrollWidth (${overflowInfo.scrollWidth}) > innerWidth (${overflowInfo.innerWidth})`);
      hasOverflow = true;
    } else {
      console.log(`✅ No overflow in ${section}.`);
    }
  }

  await browser.close();
  
  if (hasOverflow) {
    process.exit(1);
  } else {
    console.log("All sections passed horizontal overflow check.");
    process.exit(0);
  }
})();
