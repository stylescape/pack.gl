import autoprefixer from 'autoprefixer';
/**
 * Configuration object for PostCSS that includes plugins for optimization and compression
 * of CSS. This setup is typically used for production builds where minimized CSS is preferred
 * to reduce file size and improve loading times.
 */
declare const postcssConfigCompressed: {
    plugins: (typeof autoprefixer | import("postcss").Processor)[];
};
export default postcssConfigCompressed;
