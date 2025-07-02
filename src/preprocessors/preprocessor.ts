import { ParserOptions, parse as babelParser } from '@babel/parser';
import { Directive, ImportDeclaration } from '@babel/types';

import { sortImportsOffComment, sortImportsOnComment } from '../constants';
import { PrettierOptions } from '../types';
import { extractASTNodes } from '../utils/extract-ast-nodes';
import { extractIgnoredImportBlocks } from '../utils/extract-ignored-import-blocks';
import { getCodeFromAst } from '../utils/get-code-from-ast';
import { getAllCommentsFromNodes } from '../utils/get-all-comments-from-nodes';
import { getExperimentalParserPlugins } from '../utils/get-experimental-parser-plugins';
import { getSortedNodes } from '../utils/get-sorted-nodes';
import { isFileIncluded } from '../utils/is-file-included';
import { isSortImportsIgnored } from '../utils/is-sort-imports-ignored';

/**
 * Extract ignore blocks as text from the original code
 */
function extractIgnoreBlocksAsText(code: string): {
    codeWithoutIgnoreBlocks: string;
    ignoreBlocks: string[];
} {
    const lines = code.split('\n');
    const ignoreBlocks: string[] = [];
    const remainingLines: string[] = [];
    
    let inIgnoreBlock = false;
    let currentIgnoreBlock: string[] = [];
    
    for (const line of lines) {
        if (line.includes(`// ${sortImportsOffComment}`)) {
            inIgnoreBlock = true;
            currentIgnoreBlock = [line];
        } else if (line.includes(`// ${sortImportsOnComment}`)) {
            if (inIgnoreBlock) {
                currentIgnoreBlock.push(line);
                ignoreBlocks.push(currentIgnoreBlock.join('\n'));
                currentIgnoreBlock = [];
                inIgnoreBlock = false;  
            }
        } else if (inIgnoreBlock) {
            currentIgnoreBlock.push(line);
        } else {
            remainingLines.push(line);
        }
    }
    
    // Handle unclosed ignore block
    if (currentIgnoreBlock.length > 0) {
        ignoreBlocks.push(currentIgnoreBlock.join('\n'));
    }
    
    return {
        codeWithoutIgnoreBlocks: remainingLines.join('\n'),
        ignoreBlocks,
    };
}

export function preprocessor(code: string, options: PrettierOptions) {
    const {
        importOrderParserPlugins,
        importOrder,
        importOrderCaseInsensitive,
        importOrderSeparation,
        importOrderGroupNamespaceSpecifiers,
        importOrderSortSpecifiers,
        filesToInclude,
        filepath,
    } = options;

    // If filesToInclude is not empty, check if current file matches any pattern
    if (filesToInclude?.length > 0) {
        if (!filepath || !isFileIncluded(filepath, filesToInclude)) {
            return code;
        }
    }

    const parserOptions: ParserOptions = {
        sourceType: 'module',
        plugins: getExperimentalParserPlugins(importOrderParserPlugins),
    };

    const ast = babelParser(code, parserOptions);
    const interpreter = ast.program.interpreter;

    const {
        importNodes,
        directives,
    }: { importNodes: ImportDeclaration[]; directives: Directive[] } =
        extractASTNodes(ast);

    // short-circuit if there are no import declaration
    if (importNodes.length === 0) return code;
    if (isSortImportsIgnored(importNodes)) return code;

    // Check if there are any ignore blocks in the code
    const hasIgnoreBlocks = code.includes(`// ${sortImportsOffComment}`) || 
                           code.includes(`// ${sortImportsOnComment}`);

    if (hasIgnoreBlocks) {
        // Extract ignore blocks as text from the original code
        const { codeWithoutIgnoreBlocks, ignoreBlocks } = extractIgnoreBlocksAsText(code);
        
        if (ignoreBlocks.length > 0) {
            // Parse the code without ignore blocks to get only sortable imports
            const astWithoutIgnoreBlocks = babelParser(codeWithoutIgnoreBlocks, parserOptions);
            const { importNodes: sortableImportNodes, directives: sortableDirectives } = 
                extractASTNodes(astWithoutIgnoreBlocks);
            
            if (sortableImportNodes.length > 0) {
                // Sort only the sortable imports
                const sortedImports = getSortedNodes(sortableImportNodes, {
                    importOrder,
                    importOrderCaseInsensitive,
                    importOrderSeparation,
                    importOrderGroupNamespaceSpecifiers,
                    importOrderSortSpecifiers,
                });
                
                // Get the sorted imports as code
                const sortedCode = getCodeFromAst(sortedImports, sortableDirectives, codeWithoutIgnoreBlocks, interpreter);
                
                // Extract just the import section from sorted code
                const sortedLines = sortedCode.split('\n');
                const sortedImportLines: string[] = [];
                const nonImportLines: string[] = [];
                
                let foundNonImport = false;
                for (const line of sortedLines) {
                    if (line.trim().startsWith('import ') || line.trim().startsWith('//') || line.trim() === '') {
                        if (!foundNonImport) {
                            sortedImportLines.push(line);
                        } else {
                            nonImportLines.push(line);
                        }
                    } else {
                        foundNonImport = true;
                        nonImportLines.push(line);
                    }
                }
                
                // Combine sorted imports + ignore blocks + rest of code
                const finalCode = [
                    ...sortedImportLines,
                    '',
                    ...ignoreBlocks,
                    '',
                    ...nonImportLines,
                ].join('\n').replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
                
                return finalCode;
            }
        }
    }

    // Fallback to original logic if no ignore blocks
    const allImports = getSortedNodes(importNodes, {
        importOrder,
        importOrderCaseInsensitive,
        importOrderSeparation,
        importOrderGroupNamespaceSpecifiers,
        importOrderSortSpecifiers,
    });

    return getCodeFromAst(allImports, directives, code, interpreter);
}
