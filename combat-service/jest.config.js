module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/tests'], 
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
};
