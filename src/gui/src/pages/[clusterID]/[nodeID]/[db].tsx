import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button } from 'antd';
import { connect } from 'umi'
import ProTable, { TableDropdown } from '@ant-design/pro-table';

const KeyListPage = (props: any) => {
    const { menuState, match } = props;
    const { cluster } = menuState;

    let node: any;
    for (let i = 0; i < cluster.Nodes.length; i++) {
        node = cluster.Nodes[i];
        if (node.ID == match.params.nodeID) {
            break;
        }
    }

    return (
        <PageContainer
            header={{
                title: '',
                breadcrumb: {
                    routes: [
                        { path: '', breadcrumbName: cluster.Name, },
                        { path: '', breadcrumbName: node?.Addr, },
                        { path: '', breadcrumbName: 'db' + match.params.db, },
                    ],
                },
            }}
        >
            <ProTable
            >

            </ProTable>
        </PageContainer>
    );
};

export default connect(({ menuVM, loading }: any) => ({
    menuState: menuVM,
}))(KeyListPage);
