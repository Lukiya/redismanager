import { Button } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { ProFormText, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-form';
import { DeleteOutlined, SelectOutlined, EditOutlined } from '@ant-design/icons';
import { connect } from 'umi'
import { Drawer, FormInstance, Table, Card, Popconfirm, Space } from 'antd'
import { useEffect, useRef } from 'react';
import { ColumnProps } from 'antd/es/table';

const Dashboard = (props: any) => {
    const { serverListState, loading, dispatch } = props;
    const { editingServer } = serverListState;
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
                const btnSelect = record.Selected ? null : <Button type="primary" size="small" icon={<SelectOutlined />} onClick={() => dispatch({ type: "serverListVM/selectServer", payload: record })}>Select</Button>;

                return (
                    <Space>
                        {btnSelect}

                        <Button type="default" size="small" icon={<EditOutlined />} onClick={() => dispatch({ type: "serverListVM/showEditor", payload: record })}>Edit</Button>

                        <Popconfirm
                            title="Confirm?"
                            onConfirm={() => dispatch({ type: "serverListVM/removeServer", server: record })}
                            // onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="default" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
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
        dataSource={serverListState.servers}
        rowClassName={(record) => record.Selected ? "hilightRow" : ""}
    />

    //////////// form
    const form = <ProForm
        formRef={formRef}
        onFinish={async (values) => {
            values.ID = editingServer.ID;
            await dispatch({
                type: "serverListVM/saveServer",
                payload: values,
            })
        }}
        initialValues={{
            ID: editingServer.ID,
            Name: editingServer.Name,
            Addrs: editingServer.Addrs.join("\n"),
            Password: editingServer.Password,
            Selected: editingServer.Selected,
        }}
    >
        <ProForm.Group>
            <ProFormText width="md" name="Name" label="Name" />
            <ProFormText name="ID" hidden={true} />
            <ProFormSwitch name="Selected" hidden={true} />
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
        title="Server Editor"
        width="375"
        onClose={() => dispatch({ type: "serverListVM/hideEditor" })}
        visible={serverListState.editorVisible}
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
                            breadcrumbName: 'Servers',
                        },
                    ],
                },
            }}
        >
            <Card>
                <div style={{ marginBottom: "10px", textAlign: "right" }}>
                    <Button type="primary" onClick={() => dispatch({ type: "serverListVM/showEditor" })}>New</Button>
                </div>
                {table}
            </Card>
            {editor}
        </PageContainer>
    );
};

export default connect(({ serverListVM, loading }: any) => ({
    serverListState: serverListVM,
    loading: loading.models.serverListVM,
}))(Dashboard);