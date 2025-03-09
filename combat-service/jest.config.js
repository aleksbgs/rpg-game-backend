module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/tests'], // Updated to match your test location
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
};