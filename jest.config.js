const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./tsconfig');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'src',
    globalSetup: '<rootDir>/tests/globalSetup.ts',
    detectOpenHandles: true,
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'}),
    transform: {
        "<rootDir>/src/migrations/.+\\.(j|t)s?$": "ts-jest"
    },
    transformIgnorePatterns: [
        "<rootDir>/src/migrations/(?!.*)"
    ]
};
