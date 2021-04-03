import { Button } from 'antd';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';
import { connect } from 'umi'
import { Drawer, FormInstance } from 'antd'
import { useEffect, useRef } from 'react';

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
        className: "pointer",
        render: (_, x) => {
            return x.Addrs?.join(", ")
        },
    },
];

const Dashboard = (props: any) => {
    const { clusterListState, loading, dispatch } = props;
    const { editingCluster } = clusterListState;
    const formRef = useRef<FormInstance>();

    const form = <ProForm
        formRef={formRef}
        onFinish={async (values) => {
            await dispatch({
                type: "clusterListVM/saveCluster",
                payload: values,
            })
        }}
        initialValues={{
            ID: editingCluster.ID,
            Name: editingCluster.Name,
            Addrs: editingCluster.Addrs.join("\n"),
            Password: editingCluster.Password,
        }}
    >
        <ProForm.Group>
            <ProFormText width="md" name="Name" label="Name" />
        </ProForm.Group>
        <ProForm.Group>
            <ProFormTextArea width="md" name="Addrs" label="Node Address(es)&nbsp;" tooltip="Each node take one line" rules={[
                { required: true, message: 'node host address(es) are required.' },
                () => ({
                    validator(_, value: string) {
                        const regex = /^[a-zA-Z0-9\.]+:\d+?$/gm;
                        const array = value.split("\n");
                        const matches = value.match(regex);

                        if (array.length == matches?.length) {
                            return Promise.resolve();
                        }
                        return Promise.reject('Invalid host address(es) format.');
                    },
                }),
            ]} />
        </ProForm.Group>
        <ProForm.Group>
            <ProFormText.Password width="md" name="Password" label="Password" />
        </ProForm.Group>
    </ProForm>;

    const editor = <Drawer
        title="Cluster Editor"
        width="375"
        onClose={() => dispatch({ type: "clusterListVM/hideEditor" })}
        visible={clusterListState.editorVisible}
    >
        {form}
    </Drawer>;

    // reset form if initialValus has any diferences
    useEffect(() => formRef.current?.resetFields(), [form.props.initialValues]);

    return (
        <PageContainer
            header={{
                title: '',
                breadcrumb: {
                    routes: [
                        {
                            path: '',
                            breadcrumbName: 'Clusters',
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
                        data: clusterListState.clusters,
                        success: true,
                    });
                }}
                columns={columns}
                pagination={{
                    pageSize: 20,
                }}
                headerTitle="Clusters"
                toolBarRender={() => [
                    <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => dispatch({ type: "clusterListVM/showEditor" })}>New</Button>,
                ]}
                onRow={(record) => {
                    return { onClick: event => { dispatch({ type: "clusterListVM/showEditor", payload: record }); }, };
                }}
            />
            {editor}
        </PageContainer>
    );
};

export default connect(({ clusterListVM, loading }: any) => ({
    clusterListState: clusterListVM,
    loading: loading.models.clusterListVM,
}))(Dashboard);