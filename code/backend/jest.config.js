module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/config/**',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/**/*.route.ts',
  ],
  setupFilesAfterEnv: [],
  clearMocks: true,
};
