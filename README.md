# @roger/pre-hydration-cleanup

[![npm version](https://badge.fury.io/js/@roger%2Fpre-hydration-cleanup.svg)](https://badge.fury.io/js/@roger%2Fpre-hydration-cleanup)
[![CI Status](https://github.com/devluosir/pre-hydration-cleanup/workflows/CI/badge.svg)](https://github.com/devluosir/pre-hydration-cleanup/actions)
[![Coverage Status](https://coveralls.io/repos/github/devluosir/pre-hydration-cleanup/badge.svg?branch=main)](https://coveralls.io/github/devluosir/pre-hydration-cleanup?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Enterprise-grade pre-hydration cleanup utility for Next.js applications. Eliminates hydration warnings caused by browser extensions by cleaning injected DOM attributes before React hydration occurs.

## ✨ Features

- 🚀 **Zero Runtime Cost**: Executes before React hydration, no performance impact
- 🛡️ **CSP Compatible**: Supports strict Content Security Policy with nonce
- 🌍 **15+ Extensions Supported**: Pre-configured for popular browser extensions
- ⚙️ **Environment Configurable**: Customize via environment variables
- 🧪 **Fully Tested**: 100% test coverage with E2E tests
- 📊 **Development Telemetry**: Track and optimize extension attribute usage
- 🔄 **Framework Agnostic**: Works with Next.js, Vite, and vanilla HTML

## 🚀 Quick Start

### Installation

```bash
npm install @roger/pre-hydration-cleanup
# or
yarn add @roger/pre-hydration-cleanup
# or
pnpm add @roger/pre-hydration-cleanup
```

### Basic Usage

```tsx
// app/layout.tsx (Next.js 13+ App Router)
import Script from 'next/script';
import { createPreHydrationScript } from '@roger/pre-hydration-cleanup';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="pre-hydration-cleanup" strategy="beforeInteractive">
          {createPreHydrationScript()}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Quick Setup (One-liner)

```tsx
import { quickSetup } from '@roger/pre-hydration-cleanup';

// In your layout.tsx
<Script {...quickSetup()} />
```

## 🛡️ CSP-Safe Usage

For applications with strict Content Security Policy:

```tsx
// app/layout.tsx
import Script from 'next/script';
import { headers } from 'next/headers';
import { createCSPSafeScript } from '@roger/pre-hydration-cleanup';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce');
  const { getScriptProps } = createCSPSafeScript({ nonce });
  
  return (
    <html lang="en">
      <head>
        <Script {...getScriptProps()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLEANUP_ATTRS="custom-extension-attr,another-attr"
```

### Advanced Configuration

```tsx
import { createPreHydrationScript } from '@roger/pre-hydration-cleanup';

// Merge mode (default): default + environment + custom attributes
const script1 = createPreHydrationScript(['my-custom-attr']);

// Override mode: only environment + custom attributes
const script2 = createPreHydrationScript(['my-custom-attr'], true);
```

### CSP Configuration with Custom Options

```tsx
import { createCSPSafeScript } from '@roger/pre-hydration-cleanup';

const { content, getScriptProps } = createCSPSafeScript({
  customAttrs: ['company-extension'],
  useEnvOverride: false,
  nonce: 'your-nonce-here',
  enableTelemetry: process.env.NODE_ENV === 'development',
});
```

## 🎯 Supported Browser Extensions

Pre-configured support for 15+ popular extensions:

| Extension | Attributes | Notes |
|-----------|------------|-------|
| **ColorZilla** | `cz-shortcut-listen` | Color picker tool |
| **Grammarly** | `data-gr-ext-installed`, `data-gramm`, `data-gramm_editor`, `data-new-gr-c-s-check-loaded` | Grammar checker |
| **LanguageTool** | `data-lt-installed`, `data-lt-tmp-id` | Language checker |
| **LastPass** | `data-lastpass-icon-root` | Password manager |
| **Honey** | `data-honey-extension-installed` | Coupon finder |
| **AdBlock** | `data-adblock-key` | Ad blocker |
| **Microsoft Editor** | `data-ms-editor` | Microsoft's writing assistant |
| **1Password** | `data-onepassword-extension` | Password manager |
| **Bitwarden** | `data-bw-extension` | Password manager |
| **Clipboard Extensions** | `data-clipboard` | Various clipboard tools |
| **Spell Checkers** | `spellcheck` | Generic spell check attribute |
| _And more..._ | | See source for complete list |

## 🧪 Development Features

### Extension Detection & Telemetry

In development mode, the utility automatically detects and reports extension usage:

```tsx
import { devExtensionWarning } from '@roger/pre-hydration-cleanup';

// Enable extension detection in development
devExtensionWarning({
  force: false, // Set to true to ignore throttling
  throttleInterval: 5000, // Log throttling in milliseconds
  customSignatures: {
    'MyExtension': ['my-extension-attr']
  }
});
```

### Attribute Usage Statistics

Development mode automatically collects statistics on cleaned attributes:

```
[PreHydrationCleanup] 属性清理统计（开发模式）
┌─────────┬──────────────────────────────────┬──────────┐
│ (index) │               属性名              │ 清理次数  │
├─────────┼──────────────────────────────────┼──────────┤
│    0    │        'cz-shortcut-listen'      │    15    │
│    1    │      'data-gr-ext-installed'     │    12    │
│    2    │           'data-gramm'           │     8    │
└─────────┴──────────────────────────────────┴──────────┘
💡 提示：如果发现新的高频属性，可考虑添加到默认列表中
```

## 🔧 CLI Usage

Generate cleanup scripts for non-Next.js projects:

```bash
# Generate basic script
npx @roger/pre-hydration-cleanup

# With custom attributes
npx @roger/pre-hydration-cleanup --attrs "custom1,custom2"

# Output to file
npx @roger/pre-hydration-cleanup --output cleanup.js

# Generate JSON config
npx @roger/pre-hydration-cleanup --format json --output config.json

# Generate ES module
npx @roger/pre-hydration-cleanup --format module --output cleanup.mjs
```

## 🌍 Framework Integration

### Next.js (Recommended)

See examples above.

### Vite/React

```html
<!-- index.html -->
<script>
  // Paste output from CLI or generateCleanupScript()
</script>
```

### Vanilla HTML

```tsx
import { generateCleanupScript } from '@roger/pre-hydration-cleanup';

const script = generateCleanupScript(['custom-attr']);
// Insert into your HTML template
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

### Production Readiness Check

```bash
# Quick check
npm run check:production

# Full check including server startup
npm run check:production -- --full
```

## 🚀 Production Deployment

### Pre-deployment Checklist

1. **Environment Test**: Verify in incognito mode and with extensions
2. **Build Test**: Ensure `npm run build` succeeds
3. **CSP Test**: If using CSP, verify nonce injection works
4. **Performance**: Check bundle size impact (should be ~2KB)

### Platform-Specific Configuration

#### Vercel

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy", 
          "value": "script-src 'self' 'nonce-VERCEL_NONCE_PLACEHOLDER';"
        }
      ]
    }
  ]
}
```

#### Netlify

```toml
# netlify.toml
[build.environment]
  NEXT_PUBLIC_CLEANUP_ATTRS = "netlify-specific-attr"
```

#### Docker

```dockerfile
ENV NEXT_PUBLIC_CLEANUP_ATTRS="docker-extension-attr"
```

## 📊 Performance Impact

| Metric | Impact | Notes |
|--------|--------|-------|
| Bundle Size | +2KB | Inlined script, no separate request |
| Execution Time | <1ms | Runs before React hydration |
| Memory Usage | <1KB | Temporary arrays and function calls |
| Network Requests | 0 | No additional network overhead |

## 🛠️ API Reference

### Core Functions

#### `preHydrationCleanup(attrs: string[])`

Core cleanup function that removes specified attributes from `<html>` and `<body>` elements.

#### `createPreHydrationScript(customAttrs?, useEnvOverride?)`

Generates script content for Next.js `<Script>` components.

#### `createCSPSafeScript(options)`

Generates CSP-compatible script with nonce support.

#### `devExtensionWarning(options)`

Development utility for extension detection and logging.

### Constants

#### `COMMON_EXTENSION_ATTRS: readonly string[]`

Pre-configured list of common browser extension attributes.

### Types

```typescript
interface CSPSafeScriptOptions {
  customAttrs?: string[];
  useEnvOverride?: boolean;
  nonce?: string;
  enableTelemetry?: boolean;
}

interface DevWarningOptions {
  force?: boolean;
  throttleInterval?: number;
  customSignatures?: Record<string, string[]>;
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/devluosir/pre-hydration-cleanup.git
cd pre-hydration-cleanup
npm install
npm run build
npm test
```

### Reporting Issues

Please include:
- Browser and extension details
- Reproduction steps
- Expected vs actual behavior
- Console error messages

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for excellent SSR/hydration architecture
- Browser extension developers for creating useful tools
- Open source community for testing and feedback

---

**Built with ❤️ by Roger**

For enterprise support, custom integrations, or consulting services, contact us at [devluosir@gmail.com](mailto:devluosir@gmail.com).
# pre-hydration-cleanup
