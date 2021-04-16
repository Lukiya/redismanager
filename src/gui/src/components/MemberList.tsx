import { connect } from "umi";
import { Button, Table, Drawer, Form, Spin } from "antd";
import { MoreOutlined } from '@ant-design/icons';
import u from "@/u";
import DrawerActionBar from "./DrawerActionBar";
import { useEffect } from "react";

const buildColums = (props: any) => {
    const { memberListState: { type }, loading } = props;

    let title = "Field";
    switch (type) {
        case u.LIST:
            title = "Index";
            break;
        case u.ZSET:
            title = "Score";
            break;
    }

    if (type != u.SET) {
        const columns: any[] = [
            {
                title: title,
                dataIndex: 'Field',
                key: 'Field',
                defaultSortOrder: "ascend",
                // onCell: this.showEditor,
                className: "pointer",
                sorter: (a: any, b: any) => {
                    const aType = typeof (a.Field);
                    if (aType == "string") {
                        return a.Field.localeCompare(b.Field);
                    } else {
                        return a.Field - b.Field;
                    }
                },
            },
            {
                title: "Value",
                dataIndex: "Value",
                className: "pointer",
                sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
            },
        ];
        return columns;
    } else {
        const columns: any[] = [
            {
                title: title,
                dataIndex: 'Field',
                key: 'Field',
                defaultSortOrder: "ascend",
                // onCell: this.showEditor,
                className: "pointer",
                sorter: (a: any, b: any) => a.Field.localeCompare(b.Field),
            },
        ];
        return columns;
    }
};

const buildFooter = (props: any) => {
    const { dispatch, memberListState: { hasMore }, loading } = props;

    const footer = () => <div style={{ textAlign: "center" }}>
        {
            hasMore ?
                <Button type="link" icon={<MoreOutlined />} loading={loading} onClick={() => dispatch({ type: "memberListVM/loadMore" })}>Load more...</Button>
                :
                <Button type="link" disabled>All keys loaded</Button>
        }
    </div>;
    return footer;
};

const buildForm = (props: any) => {
    const { memberListState: { redisKey }, loading, dispatch } = props;

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: 20 }}><Spin /></div>
    } else if (redisKey?.Key != undefined) {

        const [formRef] = Form.useForm();

        const form = <Form
            form={formRef}
            initialValues={redisKey}
        >
            <DrawerActionBar redisKey={redisKey} formRef={formRef}></DrawerActionBar>
        </Form>;
        useEffect(() => formRef?.resetFields(), [form.props.initialValues]);

        return form;
    }
};

const MemberList = (props: any) => {
    // const { memberListState: { loading, dataSource, hasMore } } = props;
    const { memberListState: { dataSource, hasMore, title, visible, redisKey }, params, loading, dispatch } = props;

    const columns = buildColums(props);
    const footer = buildFooter(props);
    const form = buildForm(props);
    // console.log(form.props.initialValues);

    const table = <Table
        rowKey="Field"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (total) => <label>{hasMore ? "Loaded" : "Total"}: {total}</label> }}
        footer={footer}
        className="sublist"
        size="small"
        bordered
    ></Table>;

    const drawer = <Drawer
        title={title}
        visible={visible}
        width="90vw"
        afterVisibleChange={(v: boolean) => {
            if (v) {
                dispatch({
                    type: "memberListVM/load", payload: {
                        serverID: params.serverID,
                        nodeID: params.nodeID,
                        db: params.db,
                        key: redisKey.Key,
                        type: redisKey.Type,
                    }
                });
            }
        }}
        onClose={() => dispatch({ type: "memberListVM/hide" })}
    >
        {form}
        {table}
    </Drawer>;

    return drawer;
};

// export default EntryEditor
export default connect(({ memberListVM, loading }: any) => ({
    memberListState: memberListVM,
    loading: loading.models.memberListVM,
}))(MemberList);