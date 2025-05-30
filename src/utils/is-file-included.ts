import { Minimatch } from 'minimatch';
import path from 'path';

/**
 * Checks if a file path matches any of the provided patterns
 * @param filepath The file path to check
 * @param patterns Array of patterns to match against
 * @returns boolean indicating if the file path matches any pattern
 */
export function isFileIncluded(filepath: string, patterns: string[]): boolean {
    if (!patterns.length) return false;

    // Normalize the filepath to use forward slashes
    const normalizedPath = filepath.replace(/\\/g, '/');
    const basename = path.basename(normalizedPath);

    return patterns.some((pattern) => {
        // First try exact match
        if (pattern === normalizedPath || (!pattern.includes('/') && pattern === basename)) {
            return true;
        }

        // Then try minimatch
        try {
            const options = { 
                nocase: false,
                matchBase: !pattern.includes('/'),
                dot: true,
                nonegate: true,
                noext: true,
                noglobstar: !pattern.includes('**')
            };
            return new Minimatch(pattern, options).match(normalizedPath);
        } catch {
            // If minimatch fails, do a literal match
            return pattern === normalizedPath || (!pattern.includes('/') && pattern === basename);
        }
    });
}
