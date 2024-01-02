import path from 'node:path';
var svgoConfig = {
    multipass: true,
    js2svg: {
        pretty: true,
        indent: 2,
        eol: 'lf'
    },
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeUnknownsAndDefaults: {
                        keepDataAttrs: false,
                        keepRoleAttr: true,
                    },
                    removeViewBox: false,
                    inlineStyles: {
                        onlyMatchedOnce: false,
                    }
                }
            }
        },
        'cleanupListOfValues',
        {
            name: 'removeAttrs',
            params: {
                attrs: [
                    'clip-rule',
                    'fill'
                ]
            }
        },
        {
            name: 'explicitAttrs',
            type: 'visitor',
            params: {
                attributes: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '16',
                    height: '16',
                    fill: 'currentColor',
                    class: '',
                    viewBox: '0 0 16 16'
                }
            },
            fn: function (_root, params, info) {
                if (!params.attributes) {
                    return null;
                }
                var pathname = info.path;
                var basename = path.basename(pathname, '.svg');
                return {
                    element: {
                        enter: function (node, parentNode) {
                            if (node.name === 'svg' && parentNode.type === 'root') {
                                node.attributes = {};
                                for (var _i = 0, _a = Object.entries(params.attributes); _i < _a.length; _i++) {
                                    var _b = _a[_i], key = _b[0], value = _b[1];
                                    node.attributes[key] = key === 'class' ? "igl igl-".concat(basename) : value;
                                }
                            }
                        }
                    }
                };
            }
        }
    ]
};
export default svgoConfig;
//# sourceMappingURL=svgo.config.js.map