import React from 'react'
import { IRedisEntry, IEntryTableModelState, ILayoutModelState, connect, Loading, Dispatch } from 'umi';
import { Table, Dropdown, Button, Menu } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DownOutlined, RedoOutlined, ExportOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import { hash } from '@/utils/sha1'
import u from '@/utils/u';
import HashTable from '@/components/HashTable'
import ListTable from '@/components/ListTable'
import SetTable from '@/components/SetTable'
import ZSetTable from '@/components/ZSetTable'

interface IPageProps {
    model: IEntryTableModelState;
    loading: boolean;
    configs: any;
    dispatch: Dispatch;
}

class KeysPage extends React.Component<IPageProps> {
    rowClassName = (record: IRedisEntry) => {
        if (record.Type === u.STRING) {
            return "str_row";
        }
        return "";
    };

    onExpand = (expanded: boolean, record: IRedisEntry) => {
        if (expanded) {
            const { model, dispatch } = this.props;
            dispatch({
                type: 'keytable/fetchSubEntries', payload: {
                    db: model.DB,
                    key: record.Key,
                    type: record.Type,
                }
            });
        }
    };

    expandedRowRender = (record: IRedisEntry) => {
        const { model } = this.props;
        const entries = model[hash(record.Key)]
        let subtable;
        switch (record.Type) {
            case u.HASH:
                subtable = <HashTable entries={entries} />
                break;
            case u.LIST:
                subtable = <ListTable entries={entries} />
                break;
            case u.SET:
                subtable = <SetTable entries={entries} />
                break;
            case u.ZSET:
                subtable = <ZSetTable entries={entries} />
                break;
            default:
                subtable = <div>NOT SUPPORT</div>
                break;
        }
        return subtable;
    };

    onKeyCell = (record: IRedisEntry) => {
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

    onSelectionChanged = (SelectedRowKeys: React.Key[], SelectedEntries: IRedisEntry[]) => {
        this.props.dispatch({
            type: 'keytable/setState',
            payload: {
                SelectedRowKeys,
                SelectedEntries,
            },
        });
    };

    _columns: ColumnProps<IRedisEntry>[] = [
        {
            title: 'Key',
            dataIndex: 'Key',
            key: 'Key',
            defaultSortOrder: "ascend",
            sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
            // ...this.getColumnSearchProps('Key'),
            onCell: this.onKeyCell,
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
        const { model, loading, configs } = this.props;
        let pageSize = 15;
        if (!u.isNoW(configs) && !u.isNoW(configs.PageSize) && !u.isNoW(configs.PageSize.Keys)) {
            pageSize = configs.PageSize.Keys;
        }

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

                <Table<IRedisEntry>
                    rowKey="Key"
                    columns={this._columns}
                    dataSource={model.Entries}
                    loading={loading}
                    rowClassName={this.rowClassName}
                    onExpand={this.onExpand}
                    expandedRowRender={this.expandedRowRender}
                    rowSelection={{
                        selectedRowKeys: model.SelectedRowKeys,
                        onChange: this.onSelectionChanged,
                    }}
                    pagination={{ pageSize: pageSize, hideOnSinglePage: true }}
                    bordered={true}
                    size="small"
                />
            </div>
        );
    }
}

export default connect(({ layout, keytable, loading }: { layout: ILayoutModelState; keytable: IEntryTableModelState; loading: Loading }) => ({
    model: keytable,
    configs: layout.Configs,
    loading: loading.models.keytable,
}))(KeysPage);