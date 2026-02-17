const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'debug_screenshot_v2.png' });
  } catch (e) {
    console.log('Error during page load:', e.message);
  }
  await browser.close();
})();
