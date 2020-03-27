import React from 'react'
import { IKeyListModelState, IKeyDTO, connect, Loading, Dispatch } from 'umi';
import { Table, Dropdown, Button, Menu } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DownOutlined, RedoOutlined, ExportOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';

interface IPageProps {
    model: IKeyListModelState;
    loading: boolean;
    dispatch: Dispatch;
}

class KeyListPage extends React.Component<IPageProps> {
    onCell = (record: any) => {
        return {
            onClick: () => {
                const { model, dispatch } = this.props;
                dispatch({
                    type: 'editor/show',
                    payload: {
                        db: model.DB,
                        editingEntry: {
                            Key: record.Key,
                            Type: record.Type,
                            isNew: false
                        },
                    },
                });
            },
        };
    };

    _columns: ColumnProps<IKeyDTO>[] = [
        {
            title: 'Key',
            dataIndex: 'Key',
            key: 'Key',
            defaultSortOrder: "ascend",
            sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
            // ...this.getColumnSearchProps('Key'),
            onCell: this.onCell,
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

    render() {
        const { model, loading } = this.props;
        const menu = (
            <Menu>
                <Menu.Item key="string">string</Menu.Item>
                <Menu.Item key="hash">hash</Menu.Item>
                <Menu.Item key="list">list</Menu.Item>
                <Menu.Item key="set" >set</Menu.Item>
                <Menu.Item key="zset">zset</Menu.Item>
            </Menu>
        );
        return (
            <div>
                <div className="toolbar">
                    <Dropdown overlay={menu}>
                        <Button size="small" type="primary"><FileAddOutlined /> New <DownOutlined /></Button>
                    </Dropdown>
                    <Button size="small" type="default" title="Refresh"><RedoOutlined /></Button>
                    <Button size="small" type="default" title="Export"><ExportOutlined /></Button>
                    <Button size="small" type="danger" title="Delete"><DeleteOutlined /></Button>
                </div>

                <Table<IKeyDTO>
                    rowKey={x => x.Key}
                    columns={this._columns}
                    dataSource={model.Keys}
                    loading={loading}
                    size="small"
                    bordered={true}
                />
            </div>
        );
    }
}

export default connect(({ keylist, loading }: { keylist: IKeyListModelState; loading: Loading }) => ({
    model: keylist,
    loading: loading.models.keylist,
}))(KeyListPage);