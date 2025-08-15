
// Simple test for removeBinding
const { chromium } = require('./packages/playwright-core');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('Testing removeBinding...');
    
    // First expose a binding
    await page.exposeBinding('testBinding', () => 'Hello World');
    console.log('✅ exposeBinding succeeded');
    
    // Try to remove the binding
    await page.removeBinding('testBinding');
    console.log('✅ removeBinding succeeded');
    
    await browser.close();
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
})();
