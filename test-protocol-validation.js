// Direct test to see if removeBinding protocol validation works
// This simulates what happens when removeBinding is called

const fs = require('fs');
const path = require('path');

function testRemoveBindingProtocol() {
  console.log('🧪 Testing removeBinding Protocol Validation\n');
  
  try {
    // Load the validator and simulate the exact validation call
    const validatorPath = './packages/playwright-core/src/protocol/validatorPrimitives.ts';
    const validatorContent = fs.readFileSync(validatorPath, 'utf8');
    
    // Extract the findValidator logic
    const findValidatorMatch = validatorContent.match(/export function findValidator[\s\S]*?^\}/m);
    if (!findValidatorMatch) {
      console.log('❌ Could not find findValidator function');
      return;
    }
    
    console.log('✅ Found findValidator function implementation');
    
    // Load the actual scheme from validator.ts
    const schemaPath = './packages/playwright-core/src/protocol/validator.ts';
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Check if the schemas exist
    const pageSchemaExists = schemaContent.includes('scheme.PageRemoveBindingParams');
    const contextSchemaExists = schemaContent.includes('scheme.BrowserContextRemoveBindingParams');
    
    console.log(`✅ PageRemoveBindingParams schema exists: ${pageSchemaExists}`);
    console.log(`✅ BrowserContextRemoveBindingParams schema exists: ${contextSchemaExists}`);
    
    // Simulate the exact validation that would occur
    function simulateValidation(type, method, kind) {
      console.log(`\n🔍 Simulating: findValidator("${type}", "${method}", "${kind}")`);
      
      // This is the exact logic from validatorPrimitives.ts line 33
      const schemeName = type + (kind === 'Initializer' ? '' : method[0].toUpperCase() + method.substring(1)) + kind;
      console.log(`   Generated schema name: "${schemeName}"`);
      
      // Check if this schema exists in the validator file
      const schemaExists = schemaContent.includes(`scheme.${schemeName}`);
      console.log(`   Schema exists in validator: ${schemaExists}`);
      
      if (!schemaExists) {
        console.log(`   ❌ Would throw: "Unknown scheme for ${kind}: ${type}.${method}"`);
        return false;
      } else {
        console.log(`   ✅ Validation would succeed`);
        return true;
      }
    }
    
    // Test both Page and BrowserContext removeBinding
    const pageResult = simulateValidation('Page', 'removeBinding', 'Params');
    const contextResult = simulateValidation('BrowserContext', 'removeBinding', 'Params');
    
    // Test a known working method for comparison
    const exposeResult = simulateValidation('Page', 'exposeBinding', 'Params');
    
    console.log('\n📊 Results Summary:');
    console.log(`   Page.removeBinding: ${pageResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   BrowserContext.removeBinding: ${contextResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Page.exposeBinding (reference): ${exposeResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (pageResult && contextResult) {
      console.log('\n🎉 SUCCESS: removeBinding protocol validation should work!');
      console.log('💡 If you\'re still seeing the "Unknown scheme" error:');
      console.log('   1. The runtime might be using cached validator files');
      console.log('   2. Try restarting your Playwright server/process');
      console.log('   3. Ensure you\'re using the updated Playwright version');
    } else {
      console.log('\n❌ FAILED: removeBinding protocol validation is broken');
    }
    
    // Additional check: look for any differences in schema patterns
    console.log('\n🔍 Schema Pattern Analysis:');
    const exposeBindingPattern = schemaContent.match(/scheme\.PageExposeBindingParams\s*=\s*([^;]+);/);
    const removeBindingPattern = schemaContent.match(/scheme\.PageRemoveBindingParams\s*=\s*([^;]+);/);
    
    if (exposeBindingPattern && removeBindingPattern) {
      console.log('   ExposeBinding schema:', exposeBindingPattern[1].trim());
      console.log('   RemoveBinding schema:', removeBindingPattern[1].trim());
      
      if (exposeBindingPattern[1].includes('tObject') && removeBindingPattern[1].includes('tObject')) {
        console.log('   ✅ Both schemas follow the same pattern');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testRemoveBindingProtocol();