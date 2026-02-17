const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for a bit to let charts render
    await page.waitForTimeout(10000);

    console.log('Checking for UI elements...');
    const mainChart = await page.waitForSelector('[data-testid="main-chart"]', { timeout: 10000 });
    const optionsChart = await page.waitForSelector('[data-testid="options-chart"]', { timeout: 10000 });
    const cvdPanel = await page.waitForSelector('[data-testid="cvd-panel"]', { timeout: 10000 });
    const footprintChart = await page.waitForSelector('[data-testid="footprint-chart"]', { timeout: 10000 });

    if (mainChart && optionsChart && cvdPanel && footprintChart) {
      console.log('✅ All major components found!');
    } else {
      console.error('❌ Some components missing');
      process.exit(1);
    }

    // Switch to 5m interval to show footprint
    console.log('Switching to 5m interval...');
    await page.selectOption('[data-testid="chart-interval-selector"]', '5');
    await page.waitForTimeout(10000); // Wait for data to load

    // Verify chart containers have content (canvases)
    const canvases = await page.$$('canvas');
    console.log(`Found ${canvases.length} chart canvases.`);

    await page.screenshot({ path: 'dashboard_screenshot_5m.png', fullPage: true });
    console.log('Screenshot saved as dashboard_screenshot_5m.png');

  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
