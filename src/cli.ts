#!/usr/bin/env node

/**
 * CLI tool for @devluosir/pre-hydration-cleanup
 * Generates standalone cleanup scripts for non-Next.js projects
 */

import { cli } from './index.js';

// Execute CLI when this file is run directly
if (require.main === module) {
  cli();
}
