import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Input, Menu, Card, Space, Row, Col, Dropdown, Divider, Popconfirm, message, Upload, Alert, Modal } from 'antd';
import { connect } from 'umi'
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import MemberEditor from '@/components/memberEditor'
import u from '@/u';
import MemberList from '@/components/MemberList';
import Hotkeys from 'react-hot-keys';
import { useEffect } from 'react';

const { Search } = Input;
const { Dragger } = Upload;

const newClicked = (type: string, params: any, dispatch: any) => {

    u.OpenEditorForCreate(params, "", type, dispatch);
};

const buildColumns = (dispatch: any, params: any) => {
    const columns: any[] = [
        {
            title: "Key",
            dataIndex: "Key",
            defaultSortOrder: "ascend",
            sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
            // filterDropdown: () => (
            //     <Form form={searchForm}
            //         style={{ padding: 8 }}
            //         onFinish={(values) => {
            //             console.log(values);
            //             dispatch({ type: "keyListVM/load", query: {} });
            //         }}>
            //         <Form.Item name="match">
            //             <Input />
            //         </Form.Item>
            //         {/* <Input style={{ width: 188, marginBottom: 8, display: 'block' }} /> */}
            //         <Space>
            //             <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
            //             <Button style={{ width: 90 }} size="small" onClick={() => searchForm.resetFields()}>Reset</Button>
            //         </Space>
            //     </Form >
            // ),
            // filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            render: (_: any, record: any) => <a>{record.Key}</a>,
            onCell: (record: any) => {
                return {
                    onClick: () => {
                        if (record.Type == u.STRING) {
                            dispatch({ type: "memberEditorVM/show", payload: { ...params, Key: record.Key, ElemKey: "", keyEditorEnabled: true, newButtonEnabled: true, isNew: false, loading: true } });
                        } else {
                            dispatch({ type: "memberListVM/show", payload: { ...params, redisKey: record } });
                        }
                    },
                };
            },
            className: "pointer",
        },
        {
            title: 'Type',
            dataIndex: 'Type',
            sorter: (a: any, b: any) => a.Type.localeCompare(b.Type),
            width: 100,
            filters: [{ text: u.HASH, value: u.HASH }, { text: u.STRING, value: u.STRING }, { text: u.LIST, value: u.LIST }, { text: u.SET, value: u.SET }, { text: u.ZSET, value: u.ZSET }],
            onFilter: (value: any, record: any) => record.Type.includes(value),
        },
        {
            title: 'Length',
            dataIndex: 'Length',
            width: 100,
            align: "right",
            sorter: (a: any, b: any) => a.Length - b.Length,
        },
        {
            title: 'TTL',
            dataIndex: 'TTL',
            width: 100,
            align: "right",
            sorter: (a: any, b: any) => a.TTL - b.TTL,
        },
    ];

    return columns;
};

const buildFooter = (props: any) => {
    const { keyListState, keyListLoading, dispatch } = props;

    return () => <div style={{ textAlign: "center" }}>
        {
            keyListState.hasMore ?
                <Space>
                    <Button type="link" loading={keyListLoading} onClick={() => dispatch({ type: "keyListVM/loadMore" })}>Load more...</Button>
                    <Divider type="vertical" />
                    <Button type="link" loading={keyListLoading} onClick={() => dispatch({ type: "keyListVM/loadAll" })}>Load all...</Button>
                </Space>
                :
                <Button type="link" disabled>All keys loaded</Button>
        }
    </div>;
}

const buildDelHotKey = (props: any) => {
    const { keyListState: { selectedRowKeys }, dispatch } = props;
    const hasSelection = selectedRowKeys.length > 0;

    return hasSelection ? <Hotkeys keyName="del" onKeyUp={() => {
        Modal.confirm({
            title: 'Do you want to delete selected key(s)?',
            content: 'This operation cannot be undone.',
            onOk: () => dispatch({ type: 'keyListVM/deleteKeys' }),
        });
    }} filter={(e: any) => {
        return !e.target.type || e.target.type === "checkbox";
    }} /> : undefined;
};

const exportFile = (props: any) => {
    const { match: { params }, dispatch } = props;

    dispatch({
        type: "keyListVM/export", query: {
            serverID: params.serverID,
            db: params.db,
        }
    });
};

const showImporter = (props: any) => {
    const { match: { params }, dispatch } = props;

    const draggerProps = {
        name: 'file',
        // action: u.LocalRootURL() + "api/servers/" + params.serverID + "/" + params.db + "/file/import",
        accept: '.rmd',
        customRequest: (options: any) => {
            const data = new FormData()
            data.append('file', options.file)

            dispatch({
                type: 'keyListVM/import',
                payload: {
                    serverID: params.serverID,
                    db: params.db,
                    data,
                    options,
                },
            });
        },
        onChange(info: any) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} import successfully.`);
                modal.destroy();
            } else if (status === 'error') {
                message.error(`${info.file.name} upload failed.`);
            }
        },
    };
    const uploader = <Dragger {...draggerProps}>
        <p className="ant-upload-text">Click or drag rmd file to this area to upload</p>
        <Alert message="Import rmd file will override existing key(s)" type="warning" showIcon style={{ margin: "5px 10px", fontSize: "12px" }} />
    </Dragger>

    const modal = Modal.info({
        okText: "Close",
        width: 500,
        content: uploader,
    });
};

const KeyListPage = (props: any) => {
    const { menuState: { server }, keyListState: { keys, hasMore, pageSize, suggestedPageSize, selectedRowKeys }, keyListLoading, match: { params }, dispatch } = props;

    // let node: any;
    // for (let i = 0; i < server.Nodes.length; i++) {
    //     node = server.Nodes[i];
    //     if (node.ID == params.nodeID) {
    //         break;
    //     }
    // }
    // let inited = node != undefined;

    let breadcrumbRoutes: any[] = [];
    let table, actionBar, delHotKey;
    const hasSelection = selectedRowKeys.length > 0;
    // let memberEditor: any = null;
    const inited = server.ID != undefined && server.ID != "";
    if (inited) {
        ////////// breadcrumb
        breadcrumbRoutes = [
            { path: '', breadcrumbName: server.Name, },
            { path: '', breadcrumbName: "db" + params.db, },
        ];

        ////////// New menu
        const newMenu = (
            <Menu>
                <Menu.Item onClick={() => newClicked(u.STRING, params, dispatch)}>string</Menu.Item>
                <Menu.Item onClick={() => newClicked(u.HASH, params, dispatch)}>hash</Menu.Item>
                <Menu.Item onClick={() => newClicked(u.LIST, params, dispatch)}>list</Menu.Item>
                <Menu.Item onClick={() => newClicked(u.SET, params, dispatch)}>set</Menu.Item>
                <Menu.Item onClick={() => newClicked(u.ZSET, params, dispatch)}>zset</Menu.Item>
            </Menu>
        );

        ////////// Export Menu
        const exportMenu = (
            <Menu>
                <Menu.Item onClick={() => exportFile(props)} disabled={!hasSelection}>Export Selected</Menu.Item>
                <Menu.Item onClick={() => exportFile(props)}>Export All</Menu.Item>
                <Menu.Item onClick={() => showImporter(props)}>Import</Menu.Item>
            </Menu>
        );

        actionBar = <Card>
            <Row gutter={8}>
                <Col>
                    <Search loading={keyListLoading} placeholder="key name (support *)" allowClear enterButton="Search" onSearch={v => {
                        dispatch({
                            type: "keyListVM/load", query: {
                                serverID: params.serverID,
                                nodeID: params.nodeID,
                                db: params.db,
                                keyword: v,
                            }
                        });
                    }} />
                </Col>
                <Col>
                    <Dropdown overlay={newMenu}>
                        <Button icon={<PlusOutlined />}>New</Button>
                    </Dropdown>
                </Col>
                <Col>
                    <Dropdown overlay={exportMenu}>
                        <Button icon={<SaveOutlined />}>I/O</Button>
                    </Dropdown>
                </Col>
                <Col>
                    <Popconfirm
                        title="Confirm?"
                        onConfirm={() => dispatch({ type: "keyListVM/deleteKeys" })}
                        okText="YES"
                        cancelText="CANCEL"
                    >
                        <Button danger loading={keyListLoading} icon={<DeleteOutlined />} disabled={!hasSelection}>Delete</Button>
                    </Popconfirm>
                </Col>
            </Row>
        </Card>;

        ////////// table
        const columns = buildColumns(dispatch, params);

        const footer = buildFooter(props);

        table = <Table
            dataSource={keys}
            rowKey="Key"
            columns={columns}
            pagination={{
                pageSizeOptions: ["10", "20", "30", "100"],
                pageSize: pageSize > 0 ? pageSize : suggestedPageSize,
                onShowSizeChange: (_, newSize) => {
                    dispatch({ type: "keyListVM/setPageSize", pageSize: newSize })
                },
                showTotal: (total) => <label>{hasMore ? "Loaded" : "Total"}: {total}</label>,
            }}
            loading={keyListLoading}
            rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys, selectedEntries) => dispatch({ type: 'keyListVM/setState', payload: { selectedRowKeys, selectedEntries } }),
            }}
            size="small"
            bordered
            footer={footer}
        >
        </Table>;

        //////////// del hot key
        delHotKey = buildDelHotKey(props);
    }

    useEffect(() => {
        // Copy
        document.oncopy = () => dispatch({ type: 'keyListVM/copy', });
        // Paste
        document.onpaste = e => {
            const clipboardData = e.clipboardData;
            if (!clipboardData) return;

            const clipboardText = clipboardData?.getData("text");
            if (!clipboardText || clipboardText.indexOf(u.CLIPBOARD_REDIS) !== 0) {
                return;
            }

            Modal.confirm({
                title: 'Caution!',
                content: 'If key exists, it will be overrided, continue?',
                onOk() {
                    dispatch({
                        type: 'keyListVM/paste',
                        clipboardText: clipboardText,
                    });
                },
            });
        };
    }, []);

    return (
        <PageContainer
            title="Key List"
            loading={!inited}
            header={{ breadcrumb: { routes: breadcrumbRoutes, }, }}
        >
            {actionBar}
            {table}
            <MemberList params={params}></MemberList>
            <MemberEditor params={params}></MemberEditor>
            {delHotKey}
        </PageContainer>
    );
};


export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
