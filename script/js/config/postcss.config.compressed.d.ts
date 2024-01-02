import autoprefixer from 'autoprefixer';
declare const postcssConfigCompressed: {
    plugins: (typeof autoprefixer | import("postcss/lib/processor").default)[];
};
export default postcssConfigCompressed;
