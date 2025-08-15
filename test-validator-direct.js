// Direct validator test - simulating the actual protocol validation
const fs = require('fs');

// Mock the validation environment
function mockValidatorTest() {
  console.log('🔬 Direct Validator Test for removeBinding\n');
  
  try {
    // Read and execute the validator code to get the scheme object
    let validatorCode = fs.readFileSync('./packages/playwright-core/src/protocol/validator.ts', 'utf8');
    
    // Remove TypeScript-specific syntax and imports for Node.js execution
    validatorCode = validatorCode
      .replace(/import.*?from.*?;/g, '')
      .replace(/export \{[^}]*\};?/g, '')
      .replace(/export /g, '')
      .replace(/: Validator/g, '')
      .replace(/: ValidatorContext/g, '')
      .replace(/: any/g, '')
      .replace(/: string/g, '')
      .replace(/: number/g, '')
      .replace(/: boolean/g, '');
    
    // Create mock validation context and primitives
    const mockContext = {
      tObject: (obj) => obj,
      tString: 'string',
      tNumber: 'number', 
      tBoolean: 'boolean',
      tOptional: (type) => ({ optional: true, type }),
      tArray: (items) => ({ array: true, items }),
      tChannel: (type) => ({ channel: true, type }),
      tType: (type) => ({ type }),
      tEnum: (literals) => ({ enum: literals }),
      scheme: {}
    };
    
    // Mock the global functions
    global.tObject = mockContext.tObject;
    global.tString = mockContext.tString;
    global.tNumber = mockContext.tNumber;
    global.tBoolean = mockContext.tBoolean;
    global.tOptional = mockContext.tOptional;
    global.tArray = mockContext.tArray;
    global.tChannel = mockContext.tChannel;
    global.tType = mockContext.tType;
    global.tEnum = mockContext.tEnum;
    global.scheme = {};
    
    // Execute the relevant parts of the validator
    try {
      eval(validatorCode);
    } catch (e) {
      console.log('⚠️  Could not execute full validator, trying alternative approach...');
    }
    
    // Test the findValidator function simulation
    function simulateFindValidator(type, method, kind) {
      const schemeName = type + (kind === 'Initializer' ? '' : method[0].toUpperCase() + method.substring(1)) + kind;
      console.log(`🔍 Looking for schema: "${schemeName}"`);
      
      const exists = global.scheme && global.scheme[schemeName];
      return { exists, schemeName };
    }
    
    console.log('🧪 Testing Page.removeBinding validation:');
    const pageResult = simulateFindValidator('Page', 'removeBinding', 'Params');
    console.log(`  Schema name: ${pageResult.schemeName}`);
    console.log(`  Exists in scheme: ${pageResult.exists ? 'YES' : 'NO'}`);
    
    console.log('\n🧪 Testing BrowserContext.removeBinding validation:');
    const contextResult = simulateFindValidator('BrowserContext', 'removeBinding', 'Params');
    console.log(`  Schema name: ${contextResult.schemeName}`);
    console.log(`  Exists in scheme: ${contextResult.exists ? 'YES' : 'NO'}`);
    
    // Let's also check what schemas are actually available
    console.log('\n📋 Available schemas in validator:');
    if (global.scheme) {
      const schemas = Object.keys(global.scheme);
      const removeBindingSchemas = schemas.filter(s => s.includes('RemoveBinding'));
      console.log(`  Total schemas: ${schemas.length}`);
      console.log(`  RemoveBinding schemas: ${removeBindingSchemas.length}`);
      removeBindingSchemas.forEach(schema => {
        console.log(`    - ${schema}`);
      });
    } else {
      console.log('  ❌ No scheme object available');
    }
    
    // Manual check by reading the file content
    console.log('\n📖 Manual verification from validator file:');
    const validatorContent = fs.readFileSync('./packages/playwright-core/src/protocol/validator.ts', 'utf8');
    
    const pageSchemaRegex = /scheme\.PageRemoveBindingParams\s*=\s*tObject\(\{([^}]+)\}\)/;
    const contextSchemaRegex = /scheme\.BrowserContextRemoveBindingParams\s*=\s*tObject\(\{([^}]+)\}\)/;
    
    const pageMatch = validatorContent.match(pageSchemaRegex);
    const contextMatch = validatorContent.match(contextSchemaRegex);
    
    console.log(`  📝 PageRemoveBindingParams definition: ${pageMatch ? 'FOUND' : 'NOT FOUND'}`);
    if (pageMatch) {
      console.log(`    Content: tObject({${pageMatch[1]}})`);
    }
    
    console.log(`  📝 BrowserContextRemoveBindingParams definition: ${contextMatch ? 'FOUND' : 'NOT FOUND'}`);
    if (contextMatch) {
      console.log(`    Content: tObject({${contextMatch[1]}})`);
    }
    
    // Test if the error would occur
    console.log('\n🚨 Error Simulation:');
    if (pageMatch && contextMatch) {
      console.log('  ✅ Both schemas are properly defined in the validator');
      console.log('  💭 The "Unknown scheme" error suggests:');
      console.log('     1. The runtime is using a different/cached validator');
      console.log('     2. The validator module is not being reloaded');
      console.log('     3. There might be a build artifact issue');
    } else {
      console.log('  ❌ Schemas are missing - this would cause the error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

mockValidatorTest();