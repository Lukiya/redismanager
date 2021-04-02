import moment from "moment";
import { request } from "umi";

const u = {
    LocalAPI: () => {
        const r = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5002/api";
        return r;
    },
    DefaultTableData: { data: [], success: false, total: 0 },
}
export default u