/**
 * Simple test runner for replaceTemplateAdvanced function
 * This validates the fix without requiring a full test framework setup
 */

// Helper function to escape JSON strings
function escapeJsonString(str) {
    return str
        .replace(/\\/g, '\\\\')   // Backslash must be first
        .replace(/"/g, '\\"')      // Double quotes
        .replace(/\n/g, '\\n')     // Newlines
        .replace(/\r/g, '\\r')     // Carriage returns
        .replace(/\t/g, '\\t');    // Tabs
}

// Template replacement function
function replaceTemplateAdvanced(template, email) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const value = email[key];
        if (value === null || value === undefined) {
            return '';
        }
        return escapeJsonString(String(value));
    });
}

// Mock email data
const mockEmail = {
    id: 1,
    messageId: 'test-123',
    fromAddress: 'sender@example.com',
    fromName: 'Test Sender',
    toAddress: 'receiver@example.com',
    recipient: '["receiver@example.com"]',
    title: 'Test Email',
    bodyText: 'Plain text content',
    bodyHtml: '<p>HTML content</p>',
    sentAt: '2024-01-01T00:00:00Z',
    receivedAt: '2024-01-01T00:01:00Z',
    emailType: 'auth_code',
    emailResult: '123456',
    emailResultText: 'Your verification code is 123456',
    emailError: null,
};

// Test suite
const tests = [
    {
        name: 'Simple variable replacement',
        template: 'From: {fromAddress}, Code: {emailResult}',
        email: mockEmail,
        expected: 'From: sender@example.com, Code: 123456',
        validateJson: false
    },
    {
        name: 'Handle null values',
        template: 'Error: {emailError}',
        email: mockEmail,
        expected: 'Error: ',
        validateJson: false
    },
    {
        name: 'Escape double quotes in JSON',
        template: '{"title": "{title}"}',
        email: { ...mockEmail, title: 'Email with "quotes"' },
        expected: '{"title": "Email with \\"quotes\\""}',
        validateJson: true
    },
    {
        name: 'Escape newlines in JSON',
        template: '{"body": "{bodyText}"}',
        email: { ...mockEmail, bodyText: 'Line 1\nLine 2\nLine 3' },
        expected: '{"body": "Line 1\\nLine 2\\nLine 3"}',
        validateJson: true
    },
    {
        name: 'Escape backslashes in JSON',
        template: '{"path": "{bodyText}"}',
        email: { ...mockEmail, bodyText: 'Path: C:\\Users\\Test' },
        expected: '{"path": "Path: C:\\\\Users\\\\Test"}',
        validateJson: true
    },
    {
        name: 'Complex Bark webhook template',
        template: '{"title": "{title}", "body": "{bodyText}", "badge": 1, "sound": "alarm", "group": "{emailResult}"}',
        email: {
            ...mockEmail,
            title: 'Alert: "System" Update',
            bodyText: 'Message:\nLine 1\nLine 2',
            emailResult: 'Code: 123'
        },
        validateJson: true,
        validateParsed: (parsed) => {
            return parsed.title === 'Alert: "System" Update' &&
                   parsed.body === 'Message:\nLine 1\nLine 2' &&
                   parsed.badge === 1 &&
                   parsed.group === 'Code: 123';
        }
    },
    {
        name: 'Handle tabs and carriage returns',
        template: '{"content": "{bodyText}"}',
        email: { ...mockEmail, bodyText: 'Column1\tColumn2\r\nRow2' },
        expected: '{"content": "Column1\\tColumn2\\r\\nRow2"}',
        validateJson: true
    },
    {
        name: 'Handle mixed special characters',
        template: '{"title": "{title}", "body": "{bodyText}"}',
        email: {
            ...mockEmail,
            title: 'Test "quote" and\\backslash',
            bodyText: 'Line1\nLine2\tTab\r\nLine3'
        },
        validateJson: true,
        validateParsed: (parsed) => {
            return parsed.title === 'Test "quote" and\\backslash' &&
                   parsed.body === 'Line1\nLine2\tTab\r\nLine3';
        }
    },
    {
        name: 'Non-JSON template works',
        template: 'Email from {fromAddress} with title: {title}',
        email: mockEmail,
        expected: 'Email from sender@example.com with title: Test Email',
        validateJson: false
    },
    {
        name: 'Empty template',
        template: '',
        email: mockEmail,
        expected: '',
        validateJson: false
    }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running replaceTemplateAdvanced tests...\n');

tests.forEach((test) => {
    try {
        const result = replaceTemplateAdvanced(test.template, test.email);
        
        // Check expected result if provided
        if (test.expected !== undefined && result !== test.expected) {
            console.log(`❌ FAIL: ${test.name}`);
            console.log(`   Expected: ${test.expected}`);
            console.log(`   Got:      ${result}`);
            failed++;
            return;
        }
        
        // Validate JSON if required
        if (test.validateJson) {
            try {
                const parsed = JSON.parse(result);
                
                // Run custom validation if provided
                if (test.validateParsed && !test.validateParsed(parsed)) {
                    console.log(`❌ FAIL: ${test.name}`);
                    console.log(`   Custom validation failed for parsed JSON`);
                    console.log(`   Result: ${result}`);
                    failed++;
                    return;
                }
            } catch (e) {
                console.log(`❌ FAIL: ${test.name}`);
                console.log(`   Invalid JSON produced: ${result}`);
                console.log(`   Error: ${e.message}`);
                failed++;
                return;
            }
        }
        
        console.log(`✅ PASS: ${test.name}`);
        passed++;
    } catch (e) {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Exception: ${e.message}`);
        failed++;
    }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
    process.exit(1);
}
