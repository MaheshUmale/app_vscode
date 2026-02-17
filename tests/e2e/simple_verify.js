const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to dashboard...');
    // Don't wait for networkidle, just go there
    await page.goto('http://localhost:3001');

    console.log('Waiting 30 seconds for app to load and render...');
    await page.waitForTimeout(30000);

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'final_check.png', fullPage: true });

    const mainChart = await page.$('[data-testid="main-chart"]');
    if (mainChart) {
      console.log('✅ Main chart found');
    } else {
      console.log('❌ Main chart NOT found');
      // Log some page content to debug
      const content = await page.content();
      console.log('Page content length:', content.length);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
