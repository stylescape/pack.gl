import { FontAssetType, OtherAssetType, } from 'fantasticon';
var fantasticonConfig = {
    name: 'icon',
    fontTypes: [
        FontAssetType.TTF,
        FontAssetType.WOFF,
        FontAssetType.WOFF2,
        FontAssetType.EOT,
        FontAssetType.SVG,
    ],
    assetTypes: [
        OtherAssetType.CSS,
        OtherAssetType.SCSS,
        OtherAssetType.SASS,
        OtherAssetType.HTML,
        OtherAssetType.JSON,
        OtherAssetType.TS,
    ],
    formatOptions: {
        json: { indent: 4 },
        ts: {
            singleQuotes: false,
            enumName: 'icon_gl',
            constantName: 'MY_CODEPOINTS'
        }
    },
    pathOptions: {
        json: './dist/font/icon.gl.json',
        css: './dist/font/icon.gl.css',
        scss: './dist/font/icon.gl.scss',
        woff: './dist/font/icon.gl.woff',
        woff2: './dist/font/icon.gl.woff2',
    },
    codepoints: {
        'chevron-left': 57344,
        'chevron-right': 57345,
        'thumbs-up': 57358,
        'thumbs-down': 57359,
    },
    selector: '.i',
    prefix: 'icon',
    fontsUrl: './fonts',
};
export default fantasticonConfig;
//# sourceMappingURL=fantasticon.config.js.map