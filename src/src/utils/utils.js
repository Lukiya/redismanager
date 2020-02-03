import { message } from 'antd';

var u = {
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
    isSuccess: (msgCode) => {
        if (msgCode === "") {
            message.success("Success");
            return true;
        } else {
            message.error(msgCode);
            return false;
        }
    },
};

export default u