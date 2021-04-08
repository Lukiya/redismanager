import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Input, Menu, Card, FormInstance, Row, Col, Dropdown } from 'antd';
import ProForm, { ProFormText, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-form';
import { connect } from 'umi'
import { MoreOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useEffect, useRef } from 'react';
import MemberEditor from '@/components/memberEditor'
import u from '@/u';

const { Search } = Input;

const KeyListPage = (props: any) => {
    const { menuState, keyListState, keyListLoading, match, dispatch, history } = props;
    const { server } = menuState;
    const { params } = match;

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
    let memberEditor: any = null;
    if (inited) {
        const formRef = useRef<FormInstance>();
        // const [searchForm] = Form.useForm();
        // const params = {
        //     serverID: match.params.serverID,
        //     nodeID: match.params.nodeID,
        //     db: match.params.db,
        //     match: "",
        // };

        ////////// breadcrumb
        breadcrumbRoutes = [
            { path: '', breadcrumbName: server.Name, },
            { path: '', breadcrumbName: node.Addr, },
            { path: '', breadcrumbName: params.db, },
        ];

        ////////// action bar
        const menu = (
            <Menu>
                <Menu.Item key="string">string</Menu.Item>
                <Menu.Item key="hash">hash</Menu.Item>
                <Menu.Item key="list">list</Menu.Item>
                <Menu.Item key="set">set</Menu.Item>
                <Menu.Item key="zset">zset</Menu.Item>
            </Menu>
        );

        actionBar = <Card>
            <Row gutter={8}>
                <Col>
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
                </Col>
                <Col>
                    <Dropdown overlay={menu}>
                        <Button icon={<PlusOutlined />}>New</Button>
                    </Dropdown>
                </Col>
            </Row>

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
                            if (record.Type == u.STRING) {
                                dispatch({
                                    type: "memberEditorVM/show", payload: {
                                        ...params,
                                        key: record.Key,
                                        type: u.STRING,
                                        isNew: false,
                                        field: "this",
                                    }
                                })
                            } else {
                                const url = history.location.pathname + "/" + encodeURIComponent(record.Key);
                                history.push(url);
                            }
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
            {
                title: 'Action',
                width: 100,
                align: "center",
                render: (_: any, record: any) => <Button size="small" icon={<EditOutlined />} onClick={() => dispatch({
                    type: "memberEditorVM/show", payload: {
                        ...params,
                        key: record.Key,
                        type: record.Type,
                        isNew: false,
                    }
                })}>Edit</Button>
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


        //////////// editor
        const editorForm = <ProForm
            formRef={formRef}
            onFinish={async (values) => {
                // values.ID = editingServer.ID;
                // await dispatch({
                //     type: "serverListVM/saveServer",
                //     payload: values,
                // })
            }}
            initialValues={{
                // ID: editingServer.ID,
                // Name: editingServer.Name,
                // Addrs: editingServer.Addrs.join("\n"),
                // Password: editingServer.Password,
                // Selected: editingServer.Selected,
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
        useEffect(() => formRef.current?.resetFields(), [editorForm.props.initialValues]);

        memberEditor = <MemberEditor />;
    }

    return (
        <PageContainer
            title="Key List"
            loading={!inited}
            header={{ breadcrumb: { routes: breadcrumbRoutes, }, }}
        >
            {actionBar}
            {table}
            {memberEditor}
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
