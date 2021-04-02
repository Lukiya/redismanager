import { Button } from 'antd';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { connect } from 'umi'
import Highlighter from 'react-highlight-words';
import { GetServers } from '@/services/localApi';
import { Input } from 'antd';


const columns: ProColumns<any>[] = [
    {
        title: 'Name',
        dataIndex: 'Name',
        className: "pointer",
        sorter: (a: any, b: any) => a.ID.localeCompare(b.ID),
    },
    {
        title: 'Nodes',
        dataIndex: 'Addrs',
        render: (_, x) => {
            return x.Addrs?.join(", ")
        },
    },
];

const Dashboard = (props: any) => {
    const { model, loading } = props;

    return (
        <PageContainer
            header={{
                title: '',
                breadcrumb: {
                    routes: [
                        {
                            path: '',
                            breadcrumbName: 'Server List',
                        },
                    ],
                },
            }}
        >
            <ProTable<any>
                bordered={true}
                loading={loading}
                search={false}
                rowKey="ID"
                request={() => {
                    return Promise.resolve({
                        data: model.servers,
                        success: true,
                    });
                }}
                columns={columns}
                pagination={{
                    pageSize: 20,
                }}
                headerTitle="Servers"
                toolBarRender={() => [
                    <Button key="button" icon={<PlusOutlined />} type="primary">New</Button>,
                ]}
            />
        </PageContainer>
    );
};

export default connect(({ dashboard, loading }: any) => ({
    model: dashboard,
    loading: loading.models.dashboard,
}))(Dashboard);