// @ts-check
/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  checkers: ['typescript'],
  cleanTempDir: 'always',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  disableTypeChecks: 'src/**/*.ts',
  jest: {
    configFile: './jest.config.stryker.mjs',
    enableFindRelatedTests: true,
    projectType: 'custom',
  },
  mutate: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*{Fixtures,Mocks}.ts'],
  packageManager: 'pnpm',
  plugins: [
    '@stryker-mutator/jest-runner',
    '@stryker-mutator/typescript-checker',
  ],
  tempDirName: 'stryker-tmp',
  testRunner: 'jest',
  tsconfigFile: './tsconfig.json',
};
