import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = function() {};
