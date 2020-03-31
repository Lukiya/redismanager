const u = {
    STRING: "string",
    HASH: "hash",
    LIST: "list",
    SET: "set",
    ZSET: "zset",

    isNoW: (obj: any): boolean => {
        if (obj === undefined || obj === null || (!Array.isArray(obj) && obj.toString().trim() === "")) {
            return true;
        }
        else {
            return false;
        }
    },

    isSuccess: (msgCode: string): boolean => {
        return msgCode === "";
    },

    isXml: (str: string) => {
        const startPattern = /^\s*<[^>]+>/;
        const endPattern = /<\/[^>]+>\s*$/;
        return startPattern.test(str) && endPattern.test(str);
    },

    isJson: (str: string) => {
        const pattern = /(^\s*\[[\s\S]*\]\s*$)|(^\s*\{[\s\S]*\}\s*$)/;
        return pattern.test(str);
    },
}
export default u