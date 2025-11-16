import type { Email } from "@/types/email";

/**
 * JSON-safe string escaping utility
 * Properly escapes special characters for JSON strings
 */
function escapeJsonString(str: string): string {
    return str
        .replace(/\\/g, '\\\\')   // Backslash must be first
        .replace(/"/g, '\\"')      // Double quotes
        .replace(/\n/g, '\\n')     // Newlines
        .replace(/\r/g, '\\r')     // Carriage returns
        .replace(/\t/g, '\\t');    // Tabs
}

/**
 * Advanced template replacement with JSON-safe variable substitution
 * Supports {variable} syntax and handles special characters properly
 */
function replaceTemplateAdvanced(template: string, email: Email): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const value = email[key as keyof Email];
        if (value === null || value === undefined) {
            return '';
        }
        return escapeJsonString(String(value));
    });
}

// Test suite
describe('replaceTemplateAdvanced', () => {
    const mockEmail: Email = {
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

    test('should replace simple variables', () => {
        const template = 'From: {fromAddress}, Code: {emailResult}';
        const result = replaceTemplateAdvanced(template, mockEmail);
        expect(result).toBe('From: sender@example.com, Code: 123456');
    });

    test('should handle undefined/null values with empty string', () => {
        const template = 'Error: {emailError}';
        const result = replaceTemplateAdvanced(template, mockEmail);
        expect(result).toBe('Error: ');
    });

    test('should escape double quotes in JSON template', () => {
        const emailWithQuotes: Email = {
            ...mockEmail,
            title: 'Email with "quotes"',
        };
        const template = '{"title": "{title}"}';
        const result = replaceTemplateAdvanced(template, emailWithQuotes);
        expect(result).toBe('{"title": "Email with \\"quotes\\""}');
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
    });

    test('should escape newlines in JSON template', () => {
        const emailWithNewlines: Email = {
            ...mockEmail,
            bodyText: 'Line 1\nLine 2\nLine 3',
        };
        const template = '{"body": "{bodyText}"}';
        const result = replaceTemplateAdvanced(template, emailWithNewlines);
        expect(result).toBe('{"body": "Line 1\\nLine 2\\nLine 3"}');
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
    });

    test('should escape backslashes in JSON template', () => {
        const emailWithBackslashes: Email = {
            ...mockEmail,
            bodyText: 'Path: C:\\Users\\Test',
        };
        const template = '{"path": "{bodyText}"}';
        const result = replaceTemplateAdvanced(template, emailWithBackslashes);
        expect(result).toBe('{"path": "Path: C:\\\\Users\\\\Test"}');
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
    });

    test('should handle complex Bark webhook template', () => {
        const emailWithSpecialChars: Email = {
            ...mockEmail,
            title: 'Alert: "System" Update',
            bodyText: 'Message:\nLine 1\nLine 2',
            emailResult: 'Code: 123',
        };
        const template = '{"title": "{title}", "body": "{bodyText}", "badge": 1, "sound": "alarm", "group": "{emailResult}"}';
        const result = replaceTemplateAdvanced(template, emailWithSpecialChars);
        
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
        
        const parsed = JSON.parse(result);
        expect(parsed.title).toBe('Alert: "System" Update');
        expect(parsed.body).toBe('Message:\nLine 1\nLine 2');
        expect(parsed.badge).toBe(1);
        expect(parsed.group).toBe('Code: 123');
    });

    test('should handle tabs and carriage returns', () => {
        const emailWithTabs: Email = {
            ...mockEmail,
            bodyText: 'Column1\tColumn2\r\nRow2',
        };
        const template = '{"content": "{bodyText}"}';
        const result = replaceTemplateAdvanced(template, emailWithTabs);
        expect(result).toBe('{"content": "Column1\\tColumn2\\r\\nRow2"}');
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
    });

    test('should handle multiple variables in complex JSON', () => {
        const template = '{"device_key":"xxx","title":"{title}","body":"{bodyText}","level":"active","badge":1,"sound":"alarm","group":"{emailType}"}';
        const result = replaceTemplateAdvanced(template, mockEmail);
        
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
        
        const parsed = JSON.parse(result);
        expect(parsed.title).toBe('Test Email');
        expect(parsed.body).toBe('Plain text content');
        expect(parsed.group).toBe('auth_code');
    });

    test('should handle mixed special characters', () => {
        const emailWithMixed: Email = {
            ...mockEmail,
            title: 'Test "quote" and\\backslash',
            bodyText: 'Line1\nLine2\tTab\r\nLine3',
        };
        const template = '{"title": "{title}", "body": "{bodyText}"}';
        const result = replaceTemplateAdvanced(template, emailWithMixed);
        
        // Verify it's valid JSON
        expect(() => JSON.parse(result)).not.toThrow();
        
        const parsed = JSON.parse(result);
        expect(parsed.title).toBe('Test "quote" and\\backslash');
        expect(parsed.body).toBe('Line1\nLine2\tTab\r\nLine3');
    });

    test('should not break non-JSON templates', () => {
        const template = 'Email from {fromAddress} with title: {title}';
        const result = replaceTemplateAdvanced(template, mockEmail);
        expect(result).toBe('Email from sender@example.com with title: Test Email');
    });

    test('should handle empty template', () => {
        const template = '';
        const result = replaceTemplateAdvanced(template, mockEmail);
        expect(result).toBe('');
    });

    test('should handle template with no variables', () => {
        const template = '{"static": "value", "number": 123}';
        const result = replaceTemplateAdvanced(template, mockEmail);
        expect(result).toBe('{"static": "value", "number": 123}');
        expect(() => JSON.parse(result)).not.toThrow();
    });
});

// Export for use in production code
export { escapeJsonString, replaceTemplateAdvanced };
