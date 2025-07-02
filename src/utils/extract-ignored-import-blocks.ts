import { ImportDeclaration, Statement } from '@babel/types';

import { sortImportsOffComment, sortImportsOnComment } from '../constants';
import { getAllCommentsFromNodes } from './get-all-comments-from-nodes';

export interface ImportBlockSeparation {
    sortableImports: ImportDeclaration[];
    ignoredImports: ImportDeclaration[];
}

/**
 * Separates import declarations into sortable and ignored blocks
 * based on sort-imports-off and sort-imports-on comments
 */
export const extractIgnoredImportBlocks = (
    importNodes: ImportDeclaration[],
): ImportBlockSeparation => {
    const sortableImports: ImportDeclaration[] = [];
    const ignoredImports: ImportDeclaration[] = [];

    // Get all comments from all import nodes
    const allComments = getAllCommentsFromNodes(importNodes as Statement[]);
    
    // Find line numbers where ignore blocks start and end
    const ignoreBlockRanges: Array<{ start: number; end: number }> = [];
    let currentIgnoreStart: number | null = null;

    allComments.forEach((comment) => {
        if (comment.value.includes(sortImportsOffComment)) {
            currentIgnoreStart = comment.loc?.start.line || null;
        } else if (comment.value.includes(sortImportsOnComment) && currentIgnoreStart !== null) {
            const endLine = comment.loc?.end.line || null;
            if (endLine !== null) {
                ignoreBlockRanges.push({
                    start: currentIgnoreStart,
                    end: endLine,
                });
            }
            currentIgnoreStart = null;
        }
    });

    // If there's an unclosed ignore block, extend it to the end of imports
    if (currentIgnoreStart !== null) {
        const lastImportLine = importNodes[importNodes.length - 1]?.loc?.end.line;
        if (lastImportLine) {
            ignoreBlockRanges.push({
                start: currentIgnoreStart,
                end: lastImportLine,
            });
        }
    }

    // Categorize imports based on their line numbers
    importNodes.forEach((importNode) => {
        const importStartLine = importNode.loc?.start.line;
        const importEndLine = importNode.loc?.end.line;

        if (!importStartLine || !importEndLine) {
            // If we can't determine the line number, treat as sortable
            sortableImports.push(importNode);
            return;
        }

        // Check if this import falls within any ignore block
        const isInIgnoreBlock = ignoreBlockRanges.some(
            (range) => importStartLine >= range.start && importEndLine <= range.end,
        );

        if (isInIgnoreBlock) {
            ignoredImports.push(importNode);
        } else {
            sortableImports.push(importNode);
        }
    });

    return {
        sortableImports,
        ignoredImports,
    };
}; 