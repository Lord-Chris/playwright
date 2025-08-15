// Mock test for removeBinding protocol validation
// This tests the validator directly without needing the full build

// First, let's try to import the validator
const fs = require('fs');
const path = require('path');

// Mock test to validate removeBinding protocol
function testRemoveBindingValidation() {
  console.log('🧪 Testing removeBinding protocol validation...\n');

  try {
    // Read the validator file directly
    const validatorPath = './packages/playwright-core/src/protocol/validator.ts';
    const validatorContent = fs.readFileSync(validatorPath, 'utf8');
    
    // Check if PageRemoveBindingParams schema exists
    const hasPageRemoveBinding = validatorContent.includes('scheme.PageRemoveBindingParams');
    const hasBrowserContextRemoveBinding = validatorContent.includes('scheme.BrowserContextRemoveBindingParams');
    
    console.log('📋 Protocol Schema Check:');
    console.log(`  ✅ PageRemoveBindingParams schema: ${hasPageRemoveBinding ? 'FOUND' : 'MISSING'}`);
    console.log(`  ✅ BrowserContextRemoveBindingParams schema: ${hasBrowserContextRemoveBinding ? 'FOUND' : 'MISSING'}`);
    
    // Extract the schema definitions
    if (hasPageRemoveBinding) {
      const pageSchemaMatch = validatorContent.match(/scheme\.PageRemoveBindingParams = ([\s\S]*?});/);
      if (pageSchemaMatch) {
        console.log('  📝 PageRemoveBindingParams schema:');
        console.log('    ' + pageSchemaMatch[1].trim() + '}');
      }
    }
    
    if (hasBrowserContextRemoveBinding) {
      const contextSchemaMatch = validatorContent.match(/scheme\.BrowserContextRemoveBindingParams = ([\s\S]*?});/);
      if (contextSchemaMatch) {
        console.log('  📝 BrowserContextRemoveBindingParams schema:');
        console.log('    ' + contextSchemaMatch[1].trim() + '}');
      }
    }
    
    // Check channels.d.ts for type definitions
    const channelsPath = './packages/protocol/src/channels.d.ts';
    const channelsContent = fs.readFileSync(channelsPath, 'utf8');
    
    const hasPageChannelMethod = channelsContent.includes('removeBinding(params: PageRemoveBindingParams');
    const hasContextChannelMethod = channelsContent.includes('removeBinding(params: BrowserContextRemoveBindingParams');
    
    console.log('\n📡 Channel Interface Check:');
    console.log(`  ✅ Page removeBinding method: ${hasPageChannelMethod ? 'FOUND' : 'MISSING'}`);
    console.log(`  ✅ BrowserContext removeBinding method: ${hasContextChannelMethod ? 'FOUND' : 'MISSING'}`);
    
    // Test the validator schema name generation logic
    console.log('\n🔍 Testing Schema Name Generation:');
    
    // From validatorPrimitives.ts line 33:
    // const schemeName = type + (kind === 'Initializer' ? '' : method[0].toUpperCase() + method.substring(1)) + kind;
    function generateSchemaName(type, method, kind) {
      return type + (kind === 'Initializer' ? '' : method[0].toUpperCase() + method.substring(1)) + kind;
    }
    
    const pageSchemaName = generateSchemaName('Page', 'removeBinding', 'Params');
    const contextSchemaName = generateSchemaName('BrowserContext', 'removeBinding', 'Params');
    
    console.log(`  📋 Expected Page schema name: "${pageSchemaName}"`);
    console.log(`  📋 Expected BrowserContext schema name: "${contextSchemaName}"`);
    
    // Check if these exact names exist in the validator
    const hasExactPageSchema = validatorContent.includes(`scheme.${pageSchemaName}`);
    const hasExactContextSchema = validatorContent.includes(`scheme.${contextSchemaName}`);
    
    console.log(`  ✅ Page schema exists with exact name: ${hasExactPageSchema ? 'YES' : 'NO'}`);
    console.log(`  ✅ BrowserContext schema exists with exact name: ${hasExactContextSchema ? 'YES' : 'NO'}`);
    
    // Summary
    console.log('\n📊 Summary:');
    const allGood = hasPageRemoveBinding && hasBrowserContextRemoveBinding && 
                   hasPageChannelMethod && hasContextChannelMethod &&
                   hasExactPageSchema && hasExactContextSchema;
    
    if (allGood) {
      console.log('  🎉 All protocol components are correctly in place!');
      console.log('  💡 The "Unknown scheme" error might be due to:');
      console.log('     - Runtime cache issues');
      console.log('     - Build artifacts not being regenerated');
      console.log('     - Different validator instance being used');
    } else {
      console.log('  ❌ Some protocol components are missing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the mock test
testRemoveBindingValidation();