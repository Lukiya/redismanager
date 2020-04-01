import copy from 'copy-to-clipboard';

const u = {
    CLIPBOARD_REDIS: "REDIS:",
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

    getAPIAddress: () => {
        return process.env.NODE_ENV === "production" ? "/api/v1" : "http://localhost:16379/api/v1";
    },

    copyToClipboard: (content: any) => {
        copy(u.CLIPBOARD_REDIS + content);
    },

    base64ToBytesArray: (base64: any) => {
        const binStr = window.atob(base64);
        const len = binStr.length;
        let bytes = new Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        return bytes;
    },
}
export default u