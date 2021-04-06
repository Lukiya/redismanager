import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space, Input, Form, Card } from 'antd';
import { connect, Link } from 'umi'
import { MoreOutlined, SearchOutlined } from '@ant-design/icons'

const { Search } = Input;

const KeyDetailPage = (props: any) => {
    const { match, dispatch } = props;
    const { params } = match;

    ////////// breadcrumb
    const breadcrumbRoutes = [
        { path: '', breadcrumbName: params.serverID, },
        { path: '', breadcrumbName: params.nodeID, },
        { path: '/' + params.serverID + "/" + params.nodeID + "/" + params.db, breadcrumbName: params.db },
        { path: '', breadcrumbName: decodeURIComponent(match.params.key) },
    ];

    return (
        <PageContainer
            header={{ breadcrumb: { routes: breadcrumbRoutes, }, }}
        >
            {decodeURIComponent(match.params.key)}
        </PageContainer>
    );
};

// export default connect(({ menuVM, keyListVM, loading }: any) => ({
//     menuState: menuVM,
//     keyListState: keyListVM,
//     keyListLoading: loading.models.keyListVM,
// }))(KeyDetailPage);

export default KeyDetailPage;