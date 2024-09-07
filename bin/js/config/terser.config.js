var terserConfig = {
    parse: {},
    compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
        arrows: true,
    },
    mangle: {
        properties: true,
    },
    format: {
        comments: false,
        beautify: false,
    },
    sourceMap: {},
    ecma: 5,
    enclose: false,
    keep_classnames: false,
    keep_fnames: false,
    ie8: false,
    module: false,
    nameCache: null,
    safari10: false,
    toplevel: true,
};
export default terserConfig;
//# sourceMappingURL=terser.config.js.map