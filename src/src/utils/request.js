import axios from 'axios';
import NProgress from 'nprogress';
import { message } from 'antd';
import u from './utils';

// global
axios.defaults.timeout = 10000;
axios.defaults.baseURL = 'http://localhost:16379/api/v1';
// axios.defaults.withCredentials = true;

// add request interceptor
axios.interceptors.request.use((config) => {
    // show progress bar
    NProgress.start();
    return config;
}, (error) => {
    return Promise.reject(error);
});

// add response interceptor
axios.interceptors.response.use((response) => {
    // hide progress bar
    NProgress.done();
    return response;
}, (error) => {
    // hide progress bar
    NProgress.done();
    return Promise.reject(error);
});

export default function request(opt) {
    // call axios api
    return axios(opt)
        .then((response) => {
            // >>>>>>>>>>>>>> success <<<<<<<<<<<<<<
            console.debug(`${opt.method === undefined ? "GET" : opt.method} ${axios.defaults.baseURL + opt.url}: %o`, response);

            return response.data;
        })
        .catch((error) => {
            // >>>>>>>>>>>>>> failed <<<<<<<<<<<<<<
            // log error
            if (!error.response) {
                message.error(error.message);
                return console.log('Error', error.message);
            }

            // show notification 
            const status = error.response.status;
            const errortext = !u.isNoW(error.response.data) ? error.response.data : error.response.statusText;

            message.error(`${status}: ${errortext}`);

            return { code: status, message: errortext };
        });
}