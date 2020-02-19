import { message } from 'antd';
import copy from 'copy-to-clipboard';

const u = {
    CLIPBOARD_REDIS: "REDIS:",
    isNoW: (obj) => {
        if (obj === undefined || obj === null || obj.toString().trim() === "") {
            return true;
        }
        else {
            return false;
        }
    },
    isXml: (str) => {
        const startPattern = /^\s*<[^>]+>/;
        const endPattern = /<\/[^>]+>\s*$/;
        return startPattern.test(str) && endPattern.test(str);
    },
    isJson: (str) => {
        const pattern = /(^\s*\[[^\]]*\]\s*$)|(^\s*\{[^\}]*\}\s*$)/;
        const a = pattern.test(str);
        console.log(a);
        return a;
    },
    isSuccess: (msgCode) => {
        if (msgCode === "") {
            message.success("Success");
            return true;
        } else {
            message.error(msgCode);
            return false;
        }
    },
    deepClone: item => {
        if (!item) { return item; } // null, undefined values check

        let types = [Number, String, Boolean],
            result;

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item);
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                item.forEach(function (child, index, array) {
                    result[index] = u.deepClone(child);
                });
            } else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        // it is an object literal
                        result = {};
                        for (let i in item) {
                            result[i] = u.deepClone(item[i]);
                        }
                    }
                } else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            } else {
                result = item;
            }
        }

        return result;
    },
    copyToClipboard: (content) => {
        copy(u.CLIPBOARD_REDIS + content);
    },
    base64ToBytesArray: (base64) => {
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