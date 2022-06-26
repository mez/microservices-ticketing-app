'use strict';

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: [
        "./src/test/setup.ts"
    ],
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
}