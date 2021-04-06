// import moment from "moment";
// import { request } from "umi";
// import { message } from 'antd';

const u = {
    LocalRootURL: () => {
        const r = process.env.NODE_ENV === "production" ? "/" : "http://localhost:16379/";
        return r;
    },
    DefaultTableData: { data: [], success: false, total: 0 },
}
export default u