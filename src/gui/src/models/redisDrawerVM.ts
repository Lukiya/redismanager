export default {
    state: {
        visible: false,
        redisKey: {},
        title: "Detail",
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        show(state: any, { payload }: any) {
            return {
                ...state,
                ...payload,
                title: payload.redisKey.Key ?? "Detail",
                visible: true,
            };
        },
        hide(state: any) {
            return {
                ...state,
                visible: false,
            };
        },
    },
};