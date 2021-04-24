import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Input, Menu, Card, Space, Row, Col, Dropdown, Divider } from 'antd';
import { connect } from 'umi'
import { PlusOutlined } from '@ant-design/icons'
import MemberEditor from '@/components/memberEditor'
import u from '@/u';
import MemberList from '@/components/MemberList';

const { Search } = Input;

const newClicked = (type: string, params: any, dispatch: any) => {
    const payload = {
        ...params,
        entry: u.DefaultEntry,
        isNew: true,
        keyEditorEnabled: true,
        valueEditorEnabled: true,
        fieldEditorEnabled: false,
        scoreEditorEnabled: false,
        indexEditorEnabled: false,
    };
    switch (type) {
        case u.STRING:
            payload.entry.Type = u.STRING;
            break;
        case u.HASH:
            payload.fieldEditorEnabled = true;
            payload.entry.Type = u.HASH;
            break;
        case u.LIST:
            payload.indexEditorEnabled = true;
            payload.entry.Type = u.LIST;
            break;
        case u.SET:
            payload.entry.Type = u.SET;
            break;
        case u.ZSET:
            payload.scoreEditorEnabled = true;
            payload.entry.Type = u.ZSET;
            break;
    }

    dispatch({ type: "memberEditorVM/show", payload });
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
                            dispatch({ type: "memberEditorVM/show", payload: { ...params, Key: record.Key, ElemKey: "", keyEditorEnabled: true, newButtonEnabled: true } });
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

const KeyListPage = (props: any) => {
    const { menuState: { server }, keyListState: { keys, hasMore, pageSize, suggestedPageSize }, keyListLoading, match: { params }, dispatch } = props;

    // let node: any;
    // for (let i = 0; i < server.Nodes.length; i++) {
    //     node = server.Nodes[i];
    //     if (node.ID == params.nodeID) {
    //         break;
    //     }
    // }
    // let inited = node != undefined;

    let breadcrumbRoutes: any[] = [];
    let table: any = null;
    let actionBar: any = null;
    // let memberEditor: any = null;
    const inited = server.ID != undefined && server.ID != "";
    if (inited) {
        ////////// breadcrumb
        breadcrumbRoutes = [
            { path: '', breadcrumbName: server.Name, },
            { path: '', breadcrumbName: "db" + params.db, },
        ];

        ////////// action bar
        const menu = (
            <Menu>
                <Menu.Item key="string" onClick={() => newClicked(u.STRING, params, dispatch)}>string</Menu.Item>
                <Menu.Item key="hash" onClick={() => newClicked(u.HASH, params, dispatch)}>hash</Menu.Item>
                <Menu.Item key="list" onClick={() => newClicked(u.LIST, params, dispatch)}>list</Menu.Item>
                <Menu.Item key="set" onClick={() => newClicked(u.SET, params, dispatch)}>set</Menu.Item>
                <Menu.Item key="zset" onClick={() => newClicked(u.ZSET, params, dispatch)}>zset</Menu.Item>
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
                    <Dropdown overlay={menu}>
                        <Button icon={<PlusOutlined />}>New</Button>
                    </Dropdown>
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
            size="small"
            bordered
            footer={footer}
        >
        </Table>;

        //////////// editor
        // memberEditor = <MemberEditor />;
    }

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
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
