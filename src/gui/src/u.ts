// import moment from "moment";
// import { request } from "umi";
// import { message } from 'antd';

const u = {
    LocalAPI: () => {
        const r = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:16379/api";
        return r;
    },
    // HandleErr: (err: any) => {
    //     message.error(err);
    // },
    DefaultTableData: { data: [], success: false, total: 0 },
}
export default u