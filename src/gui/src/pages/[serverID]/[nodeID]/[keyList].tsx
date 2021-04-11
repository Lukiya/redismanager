import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Input, Menu, Card, FormInstance, Row, Col, Dropdown } from 'antd';
import { connect, history } from 'umi'
import { MoreOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import MemberEditor from '@/components/memberEditor'
import u from '@/u';
import RedisDrawer from '@/components/RedisDrawer';

const { Search } = Input;

const newClicked = (type: string, params: any, dispatch: any) => {
    switch (type) {
        case u.STRING:
            dispatch({
                type: "memberEditorVM/show", payload: {
                    ...params,
                    key: "",
                    type: u.STRING,
                    isNew: true,
                }
            });
            break;
        default:
            dispatch({
                type: "memberEditorVM/show", payload: {
                    ...params,
                    key: "",
                    field: "",
                    type: type,
                    isNew: true,
                }
            });
            break;
    }
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
                        dispatch({
                            type: "redisDrawerVM/show", payload: {
                                ...params,
                                redisKey: record,
                            }
                        });
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

const KeyListPage = (props: any) => {
    const { menuState: { server }, keyListState, keyListLoading, match: { params }, dispatch } = props;
    // const { server } = menuState;
    // const { params } = match;

    let node: any;
    for (let i = 0; i < server.Nodes.length; i++) {
        node = server.Nodes[i];
        if (node.ID == params.nodeID) {
            break;
        }
    }
    let inited = node != undefined;

    let breadcrumbRoutes: any[] = [];
    let table: any = null;
    let actionBar: any = null;
    // let memberEditor: any = null;
    if (inited) {
        ////////// breadcrumb
        breadcrumbRoutes = [
            { path: '', breadcrumbName: server.Name, },
            { path: '', breadcrumbName: node.Addr, },
            { path: '', breadcrumbName: params.db, },
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
                    <Search placeholder="key name (support *)" allowClear enterButton="Search" onSearch={v => {
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
        const footer = () => <div style={{ textAlign: "center" }}>
            {
                keyListState.hasMore ?
                    <Button type="link" icon={<MoreOutlined />} loading={keyListLoading} onClick={() => dispatch({ type: "keyListVM/loadMore" })}>Load more...</Button>
                    :
                    <Button type="link" disabled>All keys loaded</Button>
            }
        </div>

        table = <Table
            dataSource={keyListState.keys}
            rowKey="Key"
            columns={columns}
            pagination={{ pageSize: 20, showTotal: (total) => <label>{keyListState.hasMore ? "Loaded" : "Total"}: {total}</label> }}
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
            {<RedisDrawer params={params}></RedisDrawer>}
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
