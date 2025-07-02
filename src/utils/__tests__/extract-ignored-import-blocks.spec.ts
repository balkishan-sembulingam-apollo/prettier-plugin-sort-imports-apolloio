import { getImportNodes } from '../get-import-nodes';
import { extractIgnoredImportBlocks } from '../extract-ignored-import-blocks';

const codeWithIgnoreBlocks = `// First comment
import a from 'a';
import b from 'b';

// sort-imports-off
import z from 'z';
import y from 'y';
// sort-imports-on

import c from 'c';
import d from 'd';
`;

const codeWithUnclosedIgnoreBlock = `import a from 'a';
import b from 'b';

// sort-imports-off
import z from 'z';
import y from 'y';
import x from 'x';
`;

const codeWithMultipleIgnoreBlocks = `import a from 'a';

// sort-imports-off
import z from 'z';
// sort-imports-on

import b from 'b';

// sort-imports-off
import y from 'y';
import x from 'x';
// sort-imports-on

import c from 'c';
`;

const codeWithNoIgnoreBlocks = `import a from 'a';
import b from 'b';
import c from 'c';
`;

test('it should separate imports with ignore blocks correctly', () => {
    const importNodes = getImportNodes(codeWithIgnoreBlocks);
    const { sortableImports, ignoredImports } = extractIgnoredImportBlocks(importNodes);

    expect(sortableImports.map(node => node.source.value)).toEqual(['a', 'b', 'c', 'd']);
    expect(ignoredImports.map(node => node.source.value)).toEqual(['z', 'y']);
});

test('it should handle unclosed ignore blocks by extending to end of imports', () => {
    const importNodes = getImportNodes(codeWithUnclosedIgnoreBlock);
    const { sortableImports, ignoredImports } = extractIgnoredImportBlocks(importNodes);

    expect(sortableImports.map(node => node.source.value)).toEqual(['a', 'b']);
    expect(ignoredImports.map(node => node.source.value)).toEqual(['z', 'y', 'x']);
});

test('it should handle multiple ignore blocks correctly', () => {
    const importNodes = getImportNodes(codeWithMultipleIgnoreBlocks);
    const { sortableImports, ignoredImports } = extractIgnoredImportBlocks(importNodes);

    expect(sortableImports.map(node => node.source.value)).toEqual(['a', 'b', 'c']);
    expect(ignoredImports.map(node => node.source.value)).toEqual(['z', 'y', 'x']);
});

test('it should treat all imports as sortable when no ignore blocks are present', () => {
    const importNodes = getImportNodes(codeWithNoIgnoreBlocks);
    const { sortableImports, ignoredImports } = extractIgnoredImportBlocks(importNodes);

    expect(sortableImports.map(node => node.source.value)).toEqual(['a', 'b', 'c']);
    expect(ignoredImports).toHaveLength(0);
}); 