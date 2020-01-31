export default {
    isNoW: (obj) => {
        if (obj === undefined || obj === null || obj.toString().trim() === "") {
            return true;
        }
        else {
            return false;
        }
    },

    isXml: (str) => {
        var startPattern = /^\s*<[^>]+>/;
        var endPattern = /<\/[^>]+>\s*$/;
        return startPattern.test(str) && endPattern.test(str);
    },

    isJson: (str) => {
        var startPattern = /^\s*\{/;
        var endPattern = /\}\s*$/;
        return startPattern.test(str) && endPattern.test(str);
    },
}