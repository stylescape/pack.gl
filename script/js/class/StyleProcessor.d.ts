/// <reference types="node" />
import postcss from 'postcss';
import fs from 'fs';
declare class StyleProcessor {
    processPostCSS(css: string, styleOption: 'expanded' | 'compressed'): Promise<postcss.Result<postcss.Root>>;
    processStyles(inputFile: string, outputFile: fs.PathOrFileDescriptor, styleOption: 'expanded' | 'compressed'): Promise<void>;
}
export default StyleProcessor;
