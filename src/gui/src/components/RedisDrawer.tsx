import { Drawer, Form, Input, Card } from 'antd';
import MemberList from '@/components/MemberList'
import { connect } from 'umi';
import u from '@/u';
import { useEffect } from 'react';
import DrawerActionBar from './DrawerActionBar';

// const buildForm = (props: any) => {
//     const { state: { redisKey } } = props;
//     const [formRef] = Form.useForm();

//     const initialValues = {
//         ...redisKey,
//     };

//     const form = <Form form={formRef} initialValues={initialValues}>
//         <Form.Item label="Key" name="Key">
//             <Input />
//         </Form.Item>
//     </Form >;

//     useEffect(() => formRef?.resetFields(), [form.props.initialValues]);
//     return form;
// };

const RedisDrawer = (props: any) => {
    const { state: { redisKey, visible, title }, dispatch, params } = props;
    let children: any;

    let isUpdate = !redisKey.Key;

    // const form = buildForm(props);

    const hasMembers = !isUpdate && redisKey.Type != undefined && redisKey.Type != u.STRING;
    if (hasMembers) {
        children = <div>
            <DrawerActionBar redisKey={redisKey}></DrawerActionBar>
            <MemberList></MemberList>
        </div>;
    } else {
        children = <div>Mock Editor</div>;
    }


    return <Drawer
        title={title}
        visible={visible}
        width="90vw"
        afterVisibleChange={visible => {
            if (visible) {
                if (hasMembers) {
                    dispatch({
                        type: "memberListVM/load", payload: {
                            serverID: params.serverID,
                            nodeID: params.nodeID,
                            db: params.db,
                            key: redisKey.Key,
                            type: redisKey.Type,
                        }
                    });
                } else {
                    // reset query, void column sorting type error
                    dispatch({
                        type: "memberListVM/setState", payload: {
                            ...u.DefaultQuery,
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