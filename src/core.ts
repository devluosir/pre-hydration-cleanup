/**
 * 预水合清理工具核心实现
 * 在 React 水合前清理浏览器扩展注入的 DOM 属性，避免 hydration 警告
 */

/**
 * 常见浏览器扩展注入的属性列表
 */
export const COMMON_EXTENSION_ATTRS = [
  // ColorZilla 扩展
  'cz-shortcut-listen',
  
  // Grammarly 扩展
  'data-new-gr-c-s-check-loaded',
  'data-gr-ext-installed',
  'data-gramm_editor',
  'data-gramm',
  
  // LanguageTool 扩展
  'data-lt-installed',
  'data-lt-tmp-id',
  
  // 各种拼写检查扩展
  'spellcheck',
  
  // LastPass 扩展
  'data-lastpass-icon-root',
  
  // Honey 扩展
  'data-honey-extension-installed',
  
  // AdBlock 相关
  'data-adblock-key',
  
  // 其他常见扩展属性
  'data-ms-editor',  // Microsoft Editor
  'data-clipboard',  // 剪贴板扩展
] as const;

/**
 * 预水合清理函数
 * 这个函数会被序列化为字符串并在浏览器中执行
 * 
 * @param attrs - 需要清理的属性列表
 */
export function preHydrationCleanup(attrs: readonly string[]) {
  (function() {
    const clearExtensionAttrs = () => {
      const body = document.body;
      if (!body) return;
      
      // 清理指定的属性
      attrs.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
          // 在开发环境下记录清理的属性
          if (typeof console !== 'undefined' && console.debug) {
            console.debug(`[PreHydrationCleanup] Removed extension attribute: ${attr}`);
          }
        }
      });
      
      // 清理 HTML 元素上的扩展属性（有些扩展会注入到 html 元素）
      const html = document.documentElement;
      if (html) {
        attrs.forEach(attr => {
          if (html.hasAttribute(attr)) {
            html.removeAttribute(attr);
            if (typeof console !== 'undefined' && console.debug) {
              console.debug(`[PreHydrationCleanup] Removed extension attribute from html: ${attr}`);
            }
          }
        });
      }
    };
    
    // 立即执行一次
    clearExtensionAttrs();
    
    // 在 DOMContentLoaded 时再执行一次，确保清理完整
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', clearExtensionAttrs, { once: true });
    } else {
      // 如果 DOM 已经加载完成，再执行一次确保清理
      clearExtensionAttrs();
    }
  })();
}

/**
 * 从环境变量获取清理属性列表
 * 支持 NEXT_PUBLIC_CLEANUP_ATTRS="attr1,attr2,attr3" 格式
 */
function getAttrsFromEnv(): string[] {
  if (typeof process === 'undefined' || !process.env.NEXT_PUBLIC_CLEANUP_ATTRS) {
    return [];
  }
  
  return process.env.NEXT_PUBLIC_CLEANUP_ATTRS
    .split(',')
    .map(attr => attr.trim())
    .filter(attr => attr.length > 0);
}

/**
 * 创建预水合清理脚本的 JSX 内容
 * 
 * @param customAttrs - 自定义需要清理的属性列表，会与常见属性合并
 * @param useEnvOverride - 是否使用环境变量覆盖默认属性列表（默认为false，即合并模式）
 * @returns 用于 Next.js Script 组件的字符串内容
 */
export function createPreHydrationScript(
  customAttrs: string[] = [], 
  useEnvOverride: boolean = false
): string {
  const envAttrs = getAttrsFromEnv();
  
  let allAttrs: string[];
  
  if (useEnvOverride && envAttrs.length > 0) {
    // 覆盖模式：只使用环境变量 + 自定义属性
    allAttrs = [...envAttrs, ...customAttrs];
  } else {
    // 合并模式：默认属性 + 环境变量 + 自定义属性
    allAttrs = [...COMMON_EXTENSION_ATTRS, ...envAttrs, ...customAttrs];
  }
  
  // 去重
  const uniqueAttrs = Array.from(new Set(allAttrs));
  
  return `(${preHydrationCleanup.toString()})(${JSON.stringify(uniqueAttrs)});`;
}

/**
 * 检测当前环境中是否存在特定扩展
 * 这个函数只能在浏览器环境中使用
 * 
 * @param extensionSignatures - 扩展特征属性
 * @returns 检测到的扩展列表
 */
export function detectExtensions(
  extensionSignatures: Record<string, string[]> = {
    ColorZilla: ['cz-shortcut-listen'],
    Grammarly: ['data-gr-ext-installed', 'data-gramm'],
    LanguageTool: ['data-lt-installed'],
    LastPass: ['data-lastpass-icon-root'],
    Honey: ['data-honey-extension-installed'],
  }
): string[] {
  if (typeof window === 'undefined') return [];
  
  const detectedExtensions: string[] = [];
  const body = document.body;
  const html = document.documentElement;
  
  Object.entries(extensionSignatures).forEach(([extensionName, signatures]) => {
    const hasSignature = signatures.some(signature => 
      body?.hasAttribute(signature) || html?.hasAttribute(signature)
    );
    
    if (hasSignature) {
      detectedExtensions.push(extensionName);
    }
  });
  
  return detectedExtensions;
}

// 日志节流缓存
const logThrottleCache = new Map<string, number>();
const THROTTLE_INTERVAL = 5000; // 5秒节流间隔

/**
 * 节流日志函数，避免开发环境频繁刷屏
 * 
 * @param key - 日志唯一键
 * @param logFn - 日志函数
 * @param interval - 节流间隔（毫秒）
 */
function throttledLog(key: string, logFn: () => void, interval: number = THROTTLE_INTERVAL) {
  const now = Date.now();
  const lastLogged = logThrottleCache.get(key) || 0;
  
  if (now - lastLogged >= interval) {
    logFn();
    logThrottleCache.set(key, now);
  }
}

/**
 * 开发环境下的扩展检测和警告
 * 可以在开发时了解哪些扩展可能会影响应用
 * 
 * @param options - 配置选项
 */
export function devExtensionWarning(options: {
  /** 是否强制显示（忽略节流）*/
  force?: boolean;
  /** 节流间隔（毫秒）*/
  throttleInterval?: number;
  /** 自定义扩展特征 */
  customSignatures?: Record<string, string[]>;
} = {}) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const { force = false, throttleInterval = THROTTLE_INTERVAL, customSignatures } = options;
  
  // 延迟执行，确保 DOM 已经加载
  setTimeout(() => {
    const extensions = detectExtensions(customSignatures);
    
    if (extensions.length > 0) {
      const logKey = `dev-extension-warning-${extensions.join(',')}`;
      
      const doLog = () => {
        console.info(
          `%c[DevExtensionWarning] 检测到可能影响 hydration 的浏览器扩展: ${extensions.join(', ')}`,
          'color: #f59e0b; font-weight: bold;'
        );
        console.info(
          '%c如果遇到 hydration 警告，可能与这些扩展有关。预水合清理脚本会自动处理这些问题。',
          'color: #6b7280;'
        );
      };
      
      if (force) {
        doLog();
      } else {
        throttledLog(logKey, doLog, throttleInterval);
      }
    } else {
      // 无扩展时也可以选择性显示（用于确认检测正常工作）
      const logKey = 'no-extensions-detected';
      throttledLog(
        logKey, 
        () => console.debug('[DevExtensionWarning] 未检测到已知的浏览器扩展'),
        throttleInterval * 2 // 无扩展日志使用更长间隔
      );
    }
  }, 1000);
}

/**
 * 清理日志节流缓存（可选，用于测试或内存管理）
 */
export function clearLogThrottleCache() {
  logThrottleCache.clear();
}

/**
 * 属性遥测数据收集（仅开发环境）
 * 统计实际清理的属性，帮助维护默认列表
 */
const attributeTelemetry = new Map<string, number>();

/**
 * 收集并报告属性使用统计（开发环境）
 * 
 * @param cleanedAttrs - 实际清理的属性列表
 */
function collectAttributeTelemetry(cleanedAttrs: string[]) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  
  cleanedAttrs.forEach(attr => {
    const count = attributeTelemetry.get(attr) || 0;
    attributeTelemetry.set(attr, count + 1);
  });
  
  // 每10次清理或5分钟后报告一次统计
  const totalCleanups = Array.from(attributeTelemetry.values()).reduce((sum, count) => sum + count, 0);
  
  if (totalCleanups % 10 === 0) {
    const sorted = Array.from(attributeTelemetry.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // 显示前10个最常见的
      
    console.groupCollapsed(`[PreHydrationCleanup] 属性清理统计（开发模式）`);
    console.table(sorted.map(([attr, count]) => ({ 属性名: attr, 清理次数: count })));
    console.info('💡 提示：如果发现新的高频属性，可考虑添加到默认列表中');
    console.groupEnd();
  }
}

/**
 * 带遥测功能的预水合清理函数
 * 在开发环境下会收集属性清理统计
 */
export function preHydrationCleanupWithTelemetry(attrs: readonly string[] = COMMON_EXTENSION_ATTRS) {
  if (typeof window === 'undefined') {
    return;
  }
  
  const cleanedAttrs: string[] = [];
  const elements = [document.documentElement, document.body].filter(Boolean);
  
  elements.forEach(element => {
    attrs.forEach(attr => {
      if (element?.hasAttribute(attr)) {
        element.removeAttribute(attr);
        cleanedAttrs.push(attr);
      }
    });
  });
  
  // 收集遥测数据
  if (cleanedAttrs.length > 0) {
    collectAttributeTelemetry(cleanedAttrs);
  }
}

/**
 * 创建支持 CSP nonce 的预水合清理脚本
 * 
 * @param options - 配置选项
 * @returns 脚本配置对象，包含内容和可选的 nonce
 */
export function createCSPSafeScript(options: {
  /** 自定义属性列表 */
  customAttrs?: string[];
  /** 是否使用环境变量覆盖模式 */
  useEnvOverride?: boolean;
  /** CSP nonce（可选）*/
  nonce?: string;
  /** 是否启用开发环境遥测 */
  enableTelemetry?: boolean;
} = {}) {
  const { 
    customAttrs = [], 
    useEnvOverride = false, 
    nonce,
    enableTelemetry = true 
  } = options;
  
  const envAttrs = getAttrsFromEnv();
  
  let allAttrs: string[];
  
  if (useEnvOverride && envAttrs.length > 0) {
    allAttrs = [...envAttrs, ...customAttrs];
  } else {
    allAttrs = [...COMMON_EXTENSION_ATTRS, ...envAttrs, ...customAttrs];
  }
  
  const uniqueAttrs = Array.from(new Set(allAttrs));
  
  // 选择使用带遥测的版本还是标准版本
  const cleanupFunction = enableTelemetry ? preHydrationCleanupWithTelemetry : preHydrationCleanup;
  
  const content = `(${cleanupFunction.toString()})(${JSON.stringify(uniqueAttrs)});`;
  
  return {
    content,
    nonce,
    attrs: uniqueAttrs,
    // 辅助方法，用于生成 CSP 安全的 script props
    getScriptProps: () => ({
      id: 'pre-hydration-cleanup',
      strategy: 'beforeInteractive' as const,
      ...(nonce && { nonce }),
      children: content,
    }),
  };
}
