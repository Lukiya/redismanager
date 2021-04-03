import { Button } from 'antd';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { DeleteOutlined } from '@ant-design/icons';
import { connect } from 'umi'
import { Drawer, FormInstance, Table, Card, Popconfirm, Space } from 'antd'
import { useEffect, useRef } from 'react';
import { ColumnProps } from 'antd/es/table';

const Dashboard = (props: any) => {
    const { clusterListState, loading, dispatch } = props;
    const { editingCluster } = clusterListState;
    const formRef = useRef<FormInstance>();

    //////////// table
    const columns: ColumnProps<any>[] = [
        {
            title: 'Name',
            dataIndex: 'Name',
            sorter: (a: any, b: any) => a.ID.localeCompare(b.ID),
        },
        {
            title: 'Nodes',
            dataIndex: 'Addrs',
            render: (_: any, x: any) => {
                return x.Addrs?.join(", ")
            },
        },
        {
            title: 'Actions',
            align: "right",
            width: 240,
            render: (_: any, record: any, index: number) => {
                const btnSelect = index > 0 ? <Button type="default" size="small" onClick={() => dispatch({ type: "clusterListVM/selectCluster", payload: record })}> <DeleteOutlined /> Select</Button> : null;

                return (
                    <Space>
                        {btnSelect}

                        <Button type="default" size="small" onClick={() => dispatch({ type: "clusterListVM/showEditor", payload: record })}> <DeleteOutlined /> Edit</Button>

                        <Popconfirm
                            title="Confirm?"
                            onConfirm={() => dispatch({ type: "clusterListVM/removeCluster", payload: record })}
                            // onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" size="small" danger><DeleteOutlined /> Delete</Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];
    const table = <Table
        rowKey="ID"
        bordered={true}
        size="small"
        columns={columns}
        loading={loading}
        dataSource={clusterListState.clusters}
        rowClassName={(_, index) => {
            if (index == 0) {
                return "hilightRow"
            }
            return ""
        }}
    />

    //////////// form
    const form = <ProForm
        formRef={formRef}
        onFinish={async (values) => {
            values.ID = editingCluster.ID;
            await dispatch({
                type: "clusterListVM/saveCluster",
                payload: values,
            })
        }}
        initialValues={{
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
    useEffect(() => formRef.current?.resetFields(), [form.props.initialValues]);

    //////////// editor
    const editor = <Drawer
        title="Cluster Editor"
        width="375"
        onClose={() => dispatch({ type: "clusterListVM/hideEditor" })}
        visible={clusterListState.editorVisible}
    >
        {form}
    </Drawer>;

    //////////// render
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
            <Card>
                <div style={{ marginBottom: "10px", textAlign: "right" }}>
                    <Button type="primary" onClick={() => dispatch({ type: "clusterListVM/showEditor" })}>New</Button>
                </div>
                {table}
            </Card>
            {editor}
        </PageContainer>
    );
};

export default connect(({ clusterListVM, loading }: any) => ({
    clusterListState: clusterListVM,
    loading: loading.models.clusterListVM,
}))(Dashboard);