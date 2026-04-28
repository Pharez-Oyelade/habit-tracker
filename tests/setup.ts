import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// clear localstorage between tests
beforeEach(() => localStorage.clear())