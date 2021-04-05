import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space } from 'antd';
import { connect } from 'umi'
import { MoreOutlined } from '@ant-design/icons'

const columns = [
    {
        title: "Key",
        dataIndex: "Key",
    }
];

const KeyListPage = (props: any) => {
    const { menuState, keyListState, keyListLoading, match, dispatch } = props;
    const { cluster } = menuState;

    let node: any;
    for (let i = 0; i < cluster.Nodes.length; i++) {
        node = cluster.Nodes[i];
        if (node.ID == match.params.nodeID) {
            break;
        }
    }
    let inited = node != undefined;

    let breadcrumbRoutes: any[] = [];
    let dataSouce: any[] = [];
    if (inited) {
        dataSouce = keyListState.entries;

        breadcrumbRoutes = [
            { path: '', breadcrumbName: cluster.Name, },
            { path: '', breadcrumbName: node.Addr, },
            { path: '', breadcrumbName: 'db' + match.params.db, },
        ];
    }

    return (
        <PageContainer
            loading={!inited}
            header={{ breadcrumb: { routes: breadcrumbRoutes, }, }}
        >
            <Table
                dataSource={dataSouce}
                rowKey="Key"
                columns={columns}
                pagination={false}
                loading={keyListLoading}
                size="small"
                footer={() => <div style={{ textAlign: "center" }}><Space>
                    <Button type="link" icon={<MoreOutlined />} onClick={() => dispatch({ type: "keyListVM/loadMore" })}>more...</Button>
                    {/* <Button type="link" onClick={() => dispatch({ type: "keyListVM/loadMore" })}>all...</Button> */}
                </Space></div>}
            >

            </Table>
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
