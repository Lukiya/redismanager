import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space, Input, Form, Card } from 'antd';
import { connect, Link } from 'umi'
import { MoreOutlined, SearchOutlined } from '@ant-design/icons'

const { Search } = Input;

const KeyListPage = (props: any) => {
    const { menuState, keyListState, keyListLoading, match, dispatch, history } = props;
    const { server } = menuState;

    let node: any;
    for (let i = 0; i < server.Nodes.length; i++) {
        node = server.Nodes[i];
        if (node.ID == match.params.nodeID) {
            break;
        }
    }
    let inited = node != undefined;

    let breadcrumbRoutes: any[] = [];
    let table: any = null;
    let searchBar: any = null;
    if (inited) {
        const [searchForm] = Form.useForm();
        const params = {
            serverID: match.params.serverID,
            nodeID: match.params.nodeID,
            db: match.params.db,
            match: "",
        };

        ////////// breadcrumb
        breadcrumbRoutes = [
            { path: '', breadcrumbName: server.Name, },
            { path: '', breadcrumbName: node.Addr, },
            { path: '', breadcrumbName: match.params.db, },
        ];

        ////////// search bar
        searchBar = <Card>
            <Search placeholder="key name (support *)" allowClear enterButton="Search" onSearch={v => {
                dispatch({
                    type: "keyListVM/getKeys", query: {
                        serverID: params.serverID,
                        nodeID: params.nodeID,
                        db: params.db,
                        match: v,
                    }
                });
            }} />
        </Card>;

        ////////// table
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
                //             dispatch({ type: "keyListVM/getKeys", query: {} });
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
                            const url = history.location.pathname + "/" + encodeURIComponent(record.Key);
                            history.push(url);
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
                filters: [{ text: 'hash', value: 'hash' }, { text: 'string', value: 'string' }, { text: 'list', value: 'list' }, { text: 'set', value: 'set' }, { text: 'zset', value: 'zset' }],
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
        const footer = () => <div style={{ textAlign: "center" }}>
            {
                keyListState.hasMore ?
                    <Button type="link" icon={<MoreOutlined />} onClick={() => dispatch({ type: "keyListVM/loadMore" })}>Load more...</Button>
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
    }

    return (
        <PageContainer
            title="Key List"
            loading={!inited}
            header={{ breadcrumb: { routes: breadcrumbRoutes, }, }}
        >
            {searchBar}
            {table}
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
