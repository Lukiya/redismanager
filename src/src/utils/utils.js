export default {
    isNoW: (obj) => {
        if (obj === undefined || obj === null || obj.toString().trim() === "") {
            return true
        }
        else {
            return false
        }
    }
}