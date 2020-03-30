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
}
export default u