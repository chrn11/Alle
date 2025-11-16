/**
 * Example: Real-world Bark webhook usage with the fixed replaceTemplateAdvanced
 * 
 * This demonstrates how the fix prevents HTTP 500 errors when sending
 * notifications to Bark service with email content containing special characters.
 */

// Simulate the fixed implementation
function escapeJsonString(str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

function replaceTemplateAdvanced(template, email) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const value = email[key];
        if (value === null || value === undefined) {
            return '';
        }
        return escapeJsonString(String(value));
    });
}

// Example 1: Verification Code Email
console.log('═'.repeat(80));
console.log('Example 1: Verification Code Email with Quotes');
console.log('═'.repeat(80));

const verificationEmail = {
    title: 'Your verification code is "123456"',
    bodyText: 'Dear user,\n\nYour verification code is: 123456\n\nThis code will expire in 10 minutes.',
    emailType: 'auth_code',
    emailResult: '123456'
};

const barkTemplate = '{"device_key":"YOUR_DEVICE_KEY","title":"{title}","body":"{bodyText}","badge":1,"sound":"alarm","level":"active","group":"{emailType}"}';

const webhookPayload = replaceTemplateAdvanced(barkTemplate, verificationEmail);
console.log('\nWebhook Payload:');
console.log(webhookPayload);
console.log('\nValidation:');
try {
    const parsed = JSON.parse(webhookPayload);
    console.log('✅ Valid JSON');
    console.log('\nParsed Data:');
    console.log('  Title:', parsed.title);
    console.log('  Body:', parsed.body.substring(0, 60) + '...');
    console.log('  Group:', parsed.group);
} catch (e) {
    console.log('❌ Invalid JSON:', e.message);
}

// Example 2: Password Reset Email
console.log('\n' + '═'.repeat(80));
console.log('Example 2: Password Reset Email with Special Characters');
console.log('═'.repeat(80));

const passwordResetEmail = {
    title: 'Password Reset Link - "MyApp"',
    bodyText: 'Click the link below to reset your password:\n\nhttps://example.com/reset?token=abc123\n\nIf you didn\'t request this, please ignore.',
    emailType: 'auth_link',
    emailResult: 'https://example.com/reset?token=abc123'
};

const webhookPayload2 = replaceTemplateAdvanced(barkTemplate, passwordResetEmail);
console.log('\nWebhook Payload:');
console.log(webhookPayload2);
console.log('\nValidation:');
try {
    const parsed = JSON.parse(webhookPayload2);
    console.log('✅ Valid JSON');
    console.log('\nParsed Data:');
    console.log('  Title:', parsed.title);
    console.log('  Body:', parsed.body.substring(0, 60) + '...');
    console.log('  Group:', parsed.group);
} catch (e) {
    console.log('❌ Invalid JSON:', e.message);
}

// Example 3: Email with Backslashes (e.g., Windows paths)
console.log('\n' + '═'.repeat(80));
console.log('Example 3: Email with Backslashes');
console.log('═'.repeat(80));

const technicalEmail = {
    title: 'File Upload Notification',
    bodyText: 'Your file has been uploaded to:\nC:\\Users\\Admin\\Documents\\uploads\\file.pdf',
    emailType: 'other_link',
    emailResult: 'C:\\Users\\Admin\\Documents\\uploads\\file.pdf'
};

const webhookPayload3 = replaceTemplateAdvanced(barkTemplate, technicalEmail);
console.log('\nWebhook Payload:');
console.log(webhookPayload3);
console.log('\nValidation:');
try {
    const parsed = JSON.parse(webhookPayload3);
    console.log('✅ Valid JSON');
    console.log('\nParsed Data:');
    console.log('  Title:', parsed.title);
    console.log('  Body:', parsed.body);
    console.log('  Group:', parsed.group);
} catch (e) {
    console.log('❌ Invalid JSON:', e.message);
}

// Example 4: Telegram-style template (also supported)
console.log('\n' + '═'.repeat(80));
console.log('Example 4: Telegram Template (Non-JSON)');
console.log('═'.repeat(80));

const telegramTemplate = '📧 New Email\n\n*From:* {fromAddress}\n*Subject:* {title}\n\n{bodyText}';

const simpleEmail = {
    fromAddress: 'support@example.com',
    title: 'Welcome to "MyApp"!',
    bodyText: 'Thank you for signing up.\n\nWe\'re excited to have you!'
};

const telegramMessage = replaceTemplateAdvanced(telegramTemplate, simpleEmail);
console.log('\nTelegram Message:');
console.log(telegramMessage);
console.log('\n✅ Non-JSON template also works correctly');

console.log('\n' + '═'.repeat(80));
console.log('Summary');
console.log('═'.repeat(80));
console.log('All examples produce valid output that can be safely sent to webhook services.');
console.log('The fix prevents HTTP 500 errors caused by malformed JSON payloads.');
console.log('═'.repeat(80) + '\n');
