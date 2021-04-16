import { connect } from "umi";
import { Button, Table, Drawer, Form, Spin } from "antd";
import { MoreOutlined } from '@ant-design/icons';
import u from "@/u";
import DrawerActionBar from "./DrawerActionBar";
import { useEffect } from "react";

const onCelClick = (record: any, props: any) => {
    const { memberListState: { redisKey }, dispatch, params } = props;

    return {
        onClick: () => {
            const payload = {
                ...params,
                redisKey,
            };

            if (redisKey.Type != u.STRING && redisKey.Type != u.SET) {
                payload.field = record.Field;
            }

            dispatch({ type: "memberEditorVM/show", payload });
        },
    };
};

const buildColums = (props: any) => {
    const { memberListState: { redisKey }, loading } = props;

    let title = "Field";
    switch (redisKey.Type) {
        case u.LIST:
            title = "Index";
            break;
        case u.ZSET:
            title = "Score";
            break;
        case u.SET:
            title = "Value";
            break;
    }

    if (redisKey.Type != u.SET) {
        const columns: any[] = [
            {
                title: title,
                dataIndex: 'Field',
                defaultSortOrder: "ascend",
                className: "pointer",
                sorter: (a: any, b: any) => {
                    const aType = typeof (a.Field);
                    if (aType == "string") {
                        return a.Field.localeCompare(b.Field);
                    } else {
                        return a.Field - b.Field;
                    }
                },
                onCell: (r: any) => onCelClick(r, props),
            },
            {
                title: "Value",
                dataIndex: 'Value',
                className: "pointer",
                sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
                onclick: () => alert(1),
            },
        ];
        return columns;
    } else {
        const columns: any[] = [
            {
                title: title,
                dataIndex: 'Value',
                defaultSortOrder: "ascend",
                className: "pointer",
                sorter: (a: any, b: any) => a.Value.localeCompare(b.Value),
                onCell: (r: any) => onCelClick(r, props),
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

    if (redisKey?.Key != undefined) {
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
    let form: any, table: any = undefined;

    if (visible) {
        //////////// form
        form = buildForm(props);

        //////////// table
        table = <Table
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
    }

    const drawer = <Drawer
        title={title}
        visible={visible}
        width="95vw"
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