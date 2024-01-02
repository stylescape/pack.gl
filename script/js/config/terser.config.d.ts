declare const terserCofig: {
    compress: {
        drop_console: boolean;
        drop_debugger: boolean;
        pure_funcs: string[];
    };
    mangle: {
        properties: boolean;
    };
    format: {
        comments: boolean;
        beautify: boolean;
    };
    keep_classnames: boolean;
    keep_fnames: boolean;
    toplevel: boolean;
};
export default terserCofig;
