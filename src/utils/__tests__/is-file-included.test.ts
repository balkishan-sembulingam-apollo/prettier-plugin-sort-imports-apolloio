import { isFileIncluded } from '../is-file-included';

describe('isFileIncluded', () => {
    test('returns false when patterns array is empty', () => {
        expect(isFileIncluded('test.ts', [])).toBe(false);
    });

    test('matches exact filenames', () => {
        expect(isFileIncluded('test.ts', ['test.ts'])).toBe(true);
        expect(isFileIncluded('test.ts', ['other.ts'])).toBe(false);
    });

    test('matches wildcard patterns', () => {
        // Test * wildcard
        expect(isFileIncluded('test.ts', ['*.ts'])).toBe(true);
        expect(isFileIncluded('test.js', ['*.ts'])).toBe(false);
        expect(isFileIncluded('src/test.ts', ['src/*.ts'])).toBe(true);

        // Test multiple * wildcards
        expect(isFileIncluded('src/components/test.tsx', ['src/*/*.tsx'])).toBe(
            true,
        );
        expect(isFileIncluded('test.component.ts', ['*.*.ts'])).toBe(true);
    });

    test('matches question mark patterns', () => {
        expect(isFileIncluded('test.ts', ['test.??'])).toBe(true);
        expect(isFileIncluded('file.js', ['????.js'])).toBe(true);
        expect(isFileIncluded('a.js', ['????.js'])).toBe(false);
    });

    test('matches character class patterns', () => {
        expect(isFileIncluded('test.ts', ['test.[tj]s'])).toBe(true);
        expect(isFileIncluded('test.js', ['test.[tj]s'])).toBe(true);
        expect(isFileIncluded('test.cs', ['test.[tj]s'])).toBe(false);
    });

    test('matches multiple patterns', () => {
        expect(isFileIncluded('test.ts', ['*.js', '*.ts', '*.jsx'])).toBe(true);
        expect(isFileIncluded('test.css', ['*.js', '*.ts', '*.jsx'])).toBe(
            false,
        );
    });

    test('handles special regex characters in filenames', () => {
        expect(isFileIncluded('test.ts.', ['test.ts.'])).toBe(true);
        expect(isFileIncluded('test+file.ts', ['test+file.ts'])).toBe(true);
        expect(isFileIncluded('test[abc].ts', ['test[abc].ts'])).toBe(true);
    });

    test('handles glob patterns', () => {
        expect(
            isFileIncluded('Button.test.ts', ['*.test.ts', 'generated/**']),
        ).toBe(true);
        expect(
            isFileIncluded('generated/types.ts', ['*.test.ts', 'generated/**']),
        ).toBe(true);
        expect(
            isFileIncluded('src/Button.ts', ['*.test.ts', 'generated/**']),
        ).toBe(false);
    });

    test('matches filename-only patterns against basename', () => {
        expect(
            isFileIncluded('/long/path/to/file.js', ['*.js', 'example.ts']),
        ).toBe(true);
        expect(
            isFileIncluded('/different/path/example.ts', [
                '*.js',
                'example.ts',
            ]),
        ).toBe(true);
        expect(isFileIncluded('/path/to/file.ts', ['*.js', 'example.ts'])).toBe(
            false,
        );
    });

    test('handles special characters in filenames with patterns', () => {
        expect(
            isFileIncluded('my-component.spec.ts', ['*.spec.ts', '*test*.js']),
        ).toBe(true);
        expect(isFileIncluded('my.test.js', ['*.spec.ts', '*test*.js'])).toBe(
            true,
        );
        expect(isFileIncluded('test.jsx', ['*.spec.ts', '*test*.js'])).toBe(
            false,
        );
    });

    test('handles multiple patterns with mixed path separators', () => {
        const patterns = ['src/*.ts', 'test/*.js', '*.test.tsx'];
        expect(isFileIncluded('src/file.ts', patterns)).toBe(true);
        expect(isFileIncluded('test/file.js', patterns)).toBe(true);
        expect(isFileIncluded('component.test.tsx', patterns)).toBe(true);
        expect(isFileIncluded('src/sub/file.ts', patterns)).toBe(false);
    });

    test('handles exact filename matches with full paths', () => {
        const patterns = ['example.js', 'tsconfig.json'];
        expect(isFileIncluded('/any/path/example.js', patterns)).toBe(true);
        expect(isFileIncluded('/root/tsconfig.json', patterns)).toBe(true);
        expect(isFileIncluded('/path/to/example.test.js', patterns)).toBe(
            false,
        );
    });

    test('handles directory patterns with globs', () => {
        const patterns = ['test/**/*.*', 'generated/**/*.*'];
        expect(isFileIncluded('test/file.ts', patterns)).toBe(true);
        expect(isFileIncluded('test/unit/component.js', patterns)).toBe(true);
        expect(isFileIncluded('generated/types.ts', patterns)).toBe(true);
        expect(isFileIncluded('src/components/button.ts', patterns)).toBe(
            false,
        );
    });
});
