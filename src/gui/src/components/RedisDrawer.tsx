import { Drawer } from 'antd';
import MemberList from '@/components/MemberList'
import { connect } from 'umi';
import u from '@/u';

const RedisDrawer = (props: any) => {
    const { state: { redisKey, visible, title }, dispatch, params } = props;
    let children: any;

    const isList = redisKey.Key && redisKey.Type != undefined && redisKey.Type != u.STRING;
    if (isList) {
        children = <MemberList params={params}></MemberList>;
    } else {
        children = <div>Mock Editor</div>;
    }

    return <Drawer
        title={title}
        visible={visible}
        width="90vw"
        afterVisibleChange={visible => {
            if (visible) {
                if (isList) {
                    // dispatch({
                    //     type: "memberListVM/setState", payload: {
                    //         loading: true,
                    //     }
                    // });

                    dispatch({
                        type: "memberListVM/load", payload: {
                            serverID: params.serverID,
                            nodeID: params.nodeID,
                            db: params.db,
                            key: redisKey.Key,
                            type: redisKey.Type
                        }
                    });
                }
            }
        }}
        onClose={() => dispatch({ type: "redisDrawerVM/hide" })}
    >
        {children}
    </Drawer>
};
export default connect(({ redisDrawerVM }: any) => ({
    state: redisDrawerVM,
}))(RedisDrawer);