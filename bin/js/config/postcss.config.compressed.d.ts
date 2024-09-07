import autoprefixer from 'autoprefixer';
declare const postcssConfigCompressed: {
    plugins: (typeof autoprefixer | import("postcss").Processor)[];
};
export default postcssConfigCompressed;
