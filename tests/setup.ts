import '@testing-library/jest-dom';
import { beforeEach } from 'node:test';

// clear localstorage between tests
beforeEach(() => localStorage.clear())