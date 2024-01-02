/// <reference types="node" />
import path from 'node:path';
declare const svgoConfig: {
    multipass: boolean;
    js2svg: {
        pretty: boolean;
        indent: number;
        eol: string;
    };
    plugins: (string | {
        name: string;
        params: {
            overrides: {
                removeUnknownsAndDefaults: {
                    keepDataAttrs: boolean;
                    keepRoleAttr: boolean;
                };
                removeViewBox: boolean;
                inlineStyles: {
                    onlyMatchedOnce: boolean;
                };
            };
            attrs?: undefined;
            attributes?: undefined;
        };
        type?: undefined;
        fn?: undefined;
    } | {
        name: string;
        params: {
            attrs: string[];
            overrides?: undefined;
            attributes?: undefined;
        };
        type?: undefined;
        fn?: undefined;
    } | {
        name: string;
        type: string;
        params: {
            attributes: {
                xmlns: string;
                width: string;
                height: string;
                fill: string;
                class: string;
                viewBox: string;
            };
            overrides?: undefined;
            attrs?: undefined;
        };
        fn(_root: any, params: {
            attributes: {
                [s: string]: unknown;
            } | ArrayLike<unknown>;
        }, info: {
            path: string;
        }): {
            element: {
                enter(node: {
                    name: string;
                    attributes: {
                        [x: string]: unknown;
                    };
                }, parentNode: {
                    type: string;
                }): void;
            };
        } | null;
    })[];
};
export default svgoConfig;
