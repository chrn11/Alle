# Examples

This directory contains practical examples demonstrating the usage of fixed components in the Alle project.

## bark-webhook-example.js

Demonstrates the fixed `replaceTemplateAdvanced` function that properly handles JSON-safe string escaping for webhook payloads.

### Running the Example

```bash
node examples/bark-webhook-example.js
```

### What It Demonstrates

1. **Verification Code Email** - Shows how quotes in email titles are properly escaped
2. **Password Reset Email** - Demonstrates handling of newlines and special characters
3. **File Path Email** - Shows proper escaping of backslashes (e.g., Windows paths)
4. **Telegram Template** - Demonstrates that non-JSON templates also work correctly

### Expected Output

All examples should produce valid JSON payloads that can be safely sent to webhook services like Bark. The script validates each output by parsing the JSON and confirming it's valid.

### Key Features Demonstrated

- ✅ Proper escaping of double quotes
- ✅ Handling of newlines (`\n`) and carriage returns (`\r`)
- ✅ Correct backslash escaping
- ✅ Tab character handling
- ✅ Valid JSON output for all cases
- ✅ Support for both JSON and non-JSON templates

### Related Fix

This example relates to the fix in `src/lib/email/store.ts` that prevents HTTP 500 errors from webhook services when email content contains special characters.

See `docs/fix-replace-template-advanced.md` for detailed information about the fix.
