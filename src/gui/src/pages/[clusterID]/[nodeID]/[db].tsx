import { PageContainer } from '@ant-design/pro-layout';
import { Table } from 'antd';
import { connect } from 'umi'
import { useEffect } from 'react'

const KeyListPage = (props: any) => {
    const { menuState, keyListState, match, dispatch } = props;
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
        useEffect(() => dispatch({ type: "keyListVM/getEntries", query: match.params }), [])
        console.log(keyListState);
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
            >

            </Table>
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
}))(KeyListPage);
