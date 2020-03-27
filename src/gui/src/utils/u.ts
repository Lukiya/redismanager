const u = {
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