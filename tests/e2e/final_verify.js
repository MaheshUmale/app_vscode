const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

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

    // Verify removed panels are NOT present
    const executionPanel = await page.$('[data-testid="execution-panel"]');
    if (executionPanel) {
        console.error('❌ ExecutionPanel should have been removed');
        process.exit(1);
    }

    // Verify chart containers have content (canvases)
    const canvases = await page.$$('canvas');
    console.log(`Found ${canvases.length} chart canvases.`);

    await page.screenshot({ path: 'dashboard_screenshot.png', fullPage: true });
    console.log('Screenshot saved as dashboard_screenshot.png');

  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
