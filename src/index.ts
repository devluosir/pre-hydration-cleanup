/**
 * @devluosir/pre-hydration-cleanup
 * Enterprise-grade pre-hydration cleanup utility for Next.js applications
 * 
 * Eliminates hydration warnings caused by browser extensions by cleaning
 * injected DOM attributes before React hydration occurs.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * import Script from 'next/script';
 * import { createPreHydrationScript } from '@devluosir/pre-hydration-cleanup';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <Script id="pre-hydration-cleanup" strategy="beforeInteractive">
 *           {createPreHydrationScript()}
 *         </Script>
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // CSP-safe usage
 * import { createCSPSafeScript } from '@devluosir/pre-hydration-cleanup';
 * 
 * const { getScriptProps } = createCSPSafeScript({ nonce });
 * <Script {...getScriptProps()} />
 * ```
 */

// Core API (v1.0 Stable)
export {
  // Primary script generation utilities (STABLE API)
  createPreHydrationScript,
  createCSPSafeScript,
  
  // Core cleanup function (STABLE API)
  preHydrationCleanup,
  
  // Constants (STABLE API)
  COMMON_EXTENSION_ATTRS,
} from './core';

// Development utilities (BETA API - may change)
export {
  devExtensionWarning,
  detectExtensions,
  clearLogThrottleCache,
  preHydrationCleanupWithTelemetry,
} from './core';

// Package-specific exports
export const version = '1.0.0';

export const packageInfo = {
  name: '@devluosir/pre-hydration-cleanup',
  version: '1.0.0',
  description: 'Enterprise-grade pre-hydration cleanup utility for Next.js applications',
  author: 'Roger',
  email: 'devluosir@gmail.com',
  license: 'MIT',
  repository: 'https://github.com/devluosir/pre-hydration-cleanup',
} as const;

/**
 * Quick setup helper for common use cases (STABLE API)
 * One-liner integration for most projects
 * 
 * @example
 * ```tsx
 * import { quickSetup } from '@devluosir/pre-hydration-cleanup';
 * 
 * // In your layout.tsx
 * const scriptProps = quickSetup();
 * <Script {...scriptProps} />
 * ```
 * 
 * @example
 * ```tsx
 * // With CSP nonce
 * const scriptProps = quickSetup({ nonce: generateNonce() });
 * <Script {...scriptProps} />
 * ```
 */
export function quickSetup(options: {
  /** Custom attributes to clean */
  customAttrs?: string[];
  /** Environment override mode */
  useEnvOverride?: boolean;
  /** CSP nonce for strict security */
  nonce?: string;
  /** Enable development telemetry (default: auto-detect) */
  enableTelemetry?: boolean;
  /** Enable/disable cleanup (default: true, can be controlled by CLEANUP_DISABLE env) */
  enabled?: boolean | (() => boolean);
} = {}) {
  const { createCSPSafeScript } = require('./core');
  
  // Check for disable flags
  const isDisabled = process.env.CLEANUP_DISABLE === '1' || 
                     (typeof window !== 'undefined' && (window as any).__CLEANUP_DISABLE__);
  
  const shouldEnable = options.enabled !== undefined 
    ? (typeof options.enabled === 'function' ? options.enabled() : options.enabled)
    : !isDisabled;
  
  if (!shouldEnable) {
    // Return empty script props when disabled
    return {
      id: 'pre-hydration-cleanup-disabled',
      strategy: 'beforeInteractive' as const,
      children: '/* Pre-hydration cleanup disabled */',
    };
  }
  
  const { getScriptProps } = createCSPSafeScript({
    customAttrs: options.customAttrs,
    useEnvOverride: options.useEnvOverride,
    nonce: options.nonce,
    enableTelemetry: options.enableTelemetry ?? (process.env.NODE_ENV === 'development' && process.env.CLEANUP_TELEMETRY !== '0'),
  });
  
  return getScriptProps();
}

/**
 * Framework-agnostic cleanup (for non-Next.js projects)
 * 
 * @example
 * ```html
 * <!-- In your HTML head -->
 * <script>
 *   (function() {
 *     // Paste the output of this function here
 *   })();
 * </script>
 * ```
 */
export function generateCleanupScript(customAttrs: string[] = []): string {
  const { createPreHydrationScript } = require('./core');
  return createPreHydrationScript(customAttrs);
}

/**
 * CLI command for generating standalone scripts
 * This enables usage like: npx @devluosir/pre-hydration-cleanup
 */
export function cli() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
@devluosir/pre-hydration-cleanup CLI

Usage:
  npx @devluosir/pre-hydration-cleanup [options]

Options:
  --attrs <list>    Comma-separated list of custom attributes
  --env-override    Use environment variable override mode
  --output <file>   Output to file instead of stdout
  --format <type>   Output format: script|json|module (default: script)
  --help, -h        Show this help message

Examples:
  npx @devluosir/pre-hydration-cleanup
  npx @devluosir/pre-hydration-cleanup --attrs "custom-attr1,custom-attr2"
  npx @devluosir/pre-hydration-cleanup --format json --output cleanup.json
  npx @devluosir/pre-hydration-cleanup --env-override
    `);
    return;
  }
  
  const attrsIndex = args.indexOf('--attrs');
  const customAttrs = attrsIndex !== -1 && args[attrsIndex + 1] 
    ? args[attrsIndex + 1].split(',').map(s => s.trim())
    : [];
  
  const useEnvOverride = args.includes('--env-override');
  const format = args.includes('--format') 
    ? args[args.indexOf('--format') + 1] || 'script'
    : 'script';
  
  const { createPreHydrationScript, COMMON_EXTENSION_ATTRS } = require('./core');
  
  let output: string;
  
  switch (format) {
    case 'json':
      output = JSON.stringify({
        script: createPreHydrationScript(customAttrs, useEnvOverride),
        attrs: [...COMMON_EXTENSION_ATTRS, ...customAttrs],
        generated: new Date().toISOString(),
        version: packageInfo.version,
      }, null, 2);
      break;
      
    case 'module':
      output = `// Generated by @devluosir/pre-hydration-cleanup v${packageInfo.version}
export const preHydrationCleanupScript = ${JSON.stringify(createPreHydrationScript(customAttrs, useEnvOverride))};
export const cleanupAttrs = ${JSON.stringify([...COMMON_EXTENSION_ATTRS, ...customAttrs])};
`;
      break;
      
    default: // 'script'
      output = createPreHydrationScript(customAttrs, useEnvOverride);
      break;
  }
  
  const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
  
  if (outputFile) {
    require('fs').writeFileSync(outputFile, output, 'utf8');
    console.log(`Generated cleanup script saved to: ${outputFile}`);
  } else {
    console.log(output);
  }
}

// Auto-run CLI if this module is executed directly
if (require.main === module) {
  cli();
}
