import { ParserOptions, parse as babelParser } from '@babel/parser';
import { Directive, ImportDeclaration } from '@babel/types';

import { PrettierOptions } from '../types';
import { extractASTNodes } from '../utils/extract-ast-nodes';
import { getCodeFromAst } from '../utils/get-code-from-ast';
import { getExperimentalParserPlugins } from '../utils/get-experimental-parser-plugins';
import { getSortedNodes } from '../utils/get-sorted-nodes';
import { isFileIncluded } from '../utils/is-file-included';
import { isSortImportsIgnored } from '../utils/is-sort-imports-ignored';

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

    console.log('filesToInclude', { filesToInclude, filepath });
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

    const allImports = getSortedNodes(importNodes, {
        importOrder,
        importOrderCaseInsensitive,
        importOrderSeparation,
        importOrderGroupNamespaceSpecifiers,
        importOrderSortSpecifiers,
    });

    return getCodeFromAst(allImports, directives, code, interpreter);
}
