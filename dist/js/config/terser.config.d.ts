declare const terserConfig: {
    parse: {};
    compress: {
        drop_console: boolean;
        drop_debugger: boolean;
        pure_funcs: string[];
        arrows: boolean;
    };
    mangle: {
        properties: {
            bare_returns: boolean;
            html5_comments: boolean;
            shebang: boolean;
            spidermonkey: boolean;
        };
    };
    format: {
        comments: boolean;
        beautify: boolean;
    };
    sourceMap: {};
    ecma: number;
    enclose: boolean;
    keep_classnames: boolean;
    keep_fnames: boolean;
    ie8: boolean;
    module: boolean;
    nameCache: null;
    safari10: boolean;
    toplevel: boolean;
};
export default terserConfig;
