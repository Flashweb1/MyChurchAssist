/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/api/**/*.ts',
    '!src/app/_next/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
};

export default config;