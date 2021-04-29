import { connect } from "umi";
import { Button, Table, Drawer, Form, Space, Divider } from "antd";
import { MoreOutlined } from '@ant-design/icons';
import u from "@/u";
import DrawerActionBar from "./DrawerActionBar";
import { useEffect } from "react";

const onCelClick = (record: any, props: any) => {
    const { memberListState: { redisKey }, dispatch, params } = props;

    return {
        onClick: () => {
            dispatch({
                type: "memberEditorVM/show", payload: {
                    ...params,
                    Key: redisKey.Key,
                    ElemKey: record.Key,
                    keyEditorEnabled: false,
                    isNew: false,
                    loading: true,
                }
            });
        },
    };
};

const onNewClick = (props: any) => {
    const { memberListState: { redisKey }, dispatch, params } = props;

    u.OpenEditorForCreate(redisKey.Type, params, dispatch);
};

const buildColums = (props: any) => {
    const { memberListState: { redisKey }, loading } = props;

    let elKeyTitle = "Field";
    let valueTitle = "Value";
    switch (redisKey.Type) {
        case u.LIST:
            elKeyTitle = "Index";
            valueTitle = "Element";
            break;
        case u.SET:
            elKeyTitle = "Element";
            break;
        case u.ZSET:
            elKeyTitle = "Element";
            valueTitle = "Score";
            break;
    }

    if (redisKey.Type == u.SET) {
        const columns: any[] = [
            {
                title: elKeyTitle,
                dataIndex: 'Key',
                defaultSortOrder: "ascend",
                className: "pointer",
                sorter: u.KeySorter,
                onCell: (r: any) => onCelClick(r, props),
            },
        ];
        return columns;
    } else {
        const columns: any[] = [
            {
                title: elKeyTitle,
                dataIndex: "Key",
                defaultSortOrder: "ascend",
                className: "pointer",
                sorter: u.KeySorter,
                onCell: (r: any) => onCelClick(r, props),
            },
            {
                title: valueTitle,
                dataIndex: "Value",
                className: "pointer",
                sorter: u.ValueSorter,
                onCell: (r: any) => onCelClick(r, props),
            },
        ];
        return columns;
    }
};

const buildFooter = (props: any) => {
    const { memberListState, loading, dispatch } = props;

    const footer = () => <div style={{ textAlign: "center" }}>
        {
            memberListState.hasMore ?
                <Space>
                    <Button type="link" loading={loading} onClick={() => dispatch({ type: "memberListVM/loadMore" })}>Load more...</Button>
                    <Divider type="vertical" />
                    <Button type="link" loading={loading} onClick={() => dispatch({ type: "memberListVM/loadAll" })}>Load all...</Button>
                </Space>
                :
                <Button type="link" disabled>All elements loaded</Button>
        }
    </div>;
    return footer;
};

const buildForm = (props: any) => {
    const { memberListState: { redisKey, selectedRowKeys }, dispatch, loading } = props;
    const hasSelection = selectedRowKeys.length > 0;

    if (redisKey?.Key != undefined) {
        const [formRef] = Form.useForm();

        const form = <Form
            form={formRef}
            initialValues={redisKey}
            onFinish={(values) => {
                values.Type = redisKey.Type;
                dispatch({ type: "memberListVM/save", values });
            }}
        >
            <DrawerActionBar
                deleteButtonEnabled={hasSelection}
                newButtonEnabled={true}
                keyEditorEnabled={true}
                redisKey={redisKey}
                formRef={formRef}
                dispatch={dispatch}
                loading={loading}
                newClicked={() => onNewClick(props)}>
            </DrawerActionBar>
        </Form>;
        useEffect(() => formRef?.resetFields(), [form.props.initialValues]);

        return form;
    }
};

const MemberList = (props: any) => {
    // const { memberListState: { loading, dataSource, hasMore } } = props;
    const { memberListState: { dataSource, hasMore, pageSize, suggestedPageSize, title, visible, redisKey, selectedRowKeys }, params, loading, dispatch } = props;

    const columns = buildColums(props);
    const footer = buildFooter(props);
    let form: any, table: any = undefined;

    if (visible) {
        //////////// form
        form = buildForm(props);

        //////////// table
        table = <Table
            rowKey="Key"
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys, selectedEntries) => dispatch({ type: 'memberListVM/setState', payload: { selectedRowKeys, selectedEntries } }),
            }}
            // pagination={{ pageSize: 20, showTotal: (total) => <label>{hasMore ? "Loaded" : "Total"}: {total}</label> }}
            pagination={{
                pageSizeOptions: ["10", "20", "30", "100"],
                pageSize: pageSize > 0 ? pageSize : suggestedPageSize,
                onShowSizeChange: (_, newSize) => {
                    dispatch({ type: "memberListVM/setPageSize", pageSize: newSize })
                },
                showTotal: (total) => <label>{hasMore ? "Loaded" : "Total"}: {total}</label>,
            }}
            footer={footer}
            className="sublist"
            size="small"
            bordered
        ></Table>;
    }

    const drawer = <Drawer
        zIndex={1000}
        title={title}
        visible={visible}
        width="95vw"
        afterVisibleChange={(v: boolean) => {
            if (v) {
                dispatch({
                    type: "memberListVM/load", query: {
                        serverID: params.serverID,
                        db: params.db,
                        redisKey,
                        // key: redisKey.Key,
                        // type: redisKey.Type,
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

export default connect(({ memberListVM, loading }: any) => ({
    memberListState: memberListVM,
    loading: loading.models.memberListVM,
}))(MemberList);