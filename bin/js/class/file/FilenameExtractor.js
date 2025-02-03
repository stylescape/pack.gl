import path from "path";
class FilenameExtractor {
    getFilenameWithoutExtension(filePath) {
        return path.basename(filePath, path.extname(filePath));
    }
}
export default FilenameExtractor;
//# sourceMappingURL=FilenameExtractor.js.map