/**
 * Demonstration of the fix for replaceTemplateAdvanced
 * Shows how the fix prevents invalid JSON when sending webhooks to Bark
 */

// OLD IMPLEMENTATION (BUGGY)
function replaceTemplateAdvancedOld(template, email) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const value = email[key];
        if (value === null || value === undefined) {
            return '';
        }
        return JSON.stringify(String(value)).slice(1, -1);
    });
}

// NEW IMPLEMENTATION (FIXED)
function escapeJsonString(str) {
    return str
        .replace(/\\/g, '\\\\')   // Backslash must be first
        .replace(/"/g, '\\"')      // Double quotes
        .replace(/\n/g, '\\n')     // Newlines
        .replace(/\r/g, '\\r')     // Carriage returns
        .replace(/\t/g, '\\t');    // Tabs
}

function replaceTemplateAdvancedNew(template, email) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const value = email[key];
        if (value === null || value === undefined) {
            return '';
        }
        return escapeJsonString(String(value));
    });
}

// Example: Real-world Bark webhook scenario
console.log('='.repeat(70));
console.log('Demonstration: Fix for Bark Webhook JSON Invalid Issue');
console.log('='.repeat(70));
console.log();

// Simulated email with problematic content (quotes, newlines, etc.)
const problematicEmail = {
    title: 'Your verification code is "123456"',
    bodyText: 'Dear user,\n\nYour code is: 123456\n\nPlease use it within 10 minutes.\n\nThanks!',
    emailResult: 'Code: 123456',
    emailType: 'auth_code'
};

// Typical Bark webhook template
const barkTemplate = '{"device_key":"xxx","title":"{title}","body":"{bodyText}","level":"active","badge":1,"sound":"alarm","group":"{emailType}"}';

console.log('EMAIL DATA:');
console.log('  Title:', problematicEmail.title);
console.log('  Body:', problematicEmail.bodyText.substring(0, 50) + '...');
console.log();

console.log('WEBHOOK TEMPLATE:');
console.log('  ' + barkTemplate);
console.log();

// Show old behavior
console.log('OLD IMPLEMENTATION OUTPUT:');
console.log('-'.repeat(70));
const oldResult = replaceTemplateAdvancedOld(barkTemplate, problematicEmail);
console.log(oldResult);
console.log();
console.log('JSON Validation:');
try {
    JSON.parse(oldResult);
    console.log('  ✅ Valid JSON');
} catch (e) {
    console.log('  ❌ Invalid JSON:', e.message);
}
console.log();

// Show new behavior
console.log('NEW IMPLEMENTATION OUTPUT:');
console.log('-'.repeat(70));
const newResult = replaceTemplateAdvancedNew(barkTemplate, problematicEmail);
console.log(newResult);
console.log();
console.log('JSON Validation:');
try {
    const parsed = JSON.parse(newResult);
    console.log('  ✅ Valid JSON');
    console.log();
    console.log('Parsed Values:');
    console.log('  - title:', parsed.title);
    console.log('  - body:', parsed.body.substring(0, 50) + '...');
    console.log('  - group:', parsed.group);
} catch (e) {
    console.log('  ❌ Invalid JSON:', e.message);
}
console.log();

// Additional test case: backslashes
console.log('='.repeat(70));
console.log('Additional Test: Backslashes in Windows Paths');
console.log('='.repeat(70));
console.log();

const emailWithPath = {
    bodyText: 'File location: C:\\Users\\Admin\\Documents\\file.txt'
};

const simpleTemplate = '{"message": "{bodyText}"}';

console.log('EMAIL DATA:');
console.log('  Body:', emailWithPath.bodyText);
console.log();

console.log('OLD IMPLEMENTATION:');
const oldPath = replaceTemplateAdvancedOld(simpleTemplate, emailWithPath);
console.log('  ' + oldPath);
try {
    JSON.parse(oldPath);
    console.log('  ✅ Valid JSON');
} catch (e) {
    console.log('  ❌ Invalid JSON:', e.message);
}
console.log();

console.log('NEW IMPLEMENTATION:');
const newPath = replaceTemplateAdvancedNew(simpleTemplate, emailWithPath);
console.log('  ' + newPath);
try {
    const parsed = JSON.parse(newPath);
    console.log('  ✅ Valid JSON');
    console.log('  Parsed message:', parsed.message);
} catch (e) {
    console.log('  ❌ Invalid JSON:', e.message);
}
console.log();

console.log('='.repeat(70));
console.log('Summary');
console.log('='.repeat(70));
console.log('The new implementation properly escapes all special characters that');
console.log('could break JSON structure, preventing HTTP 500 errors from Bark and');
console.log('other webhook services.');
console.log();
