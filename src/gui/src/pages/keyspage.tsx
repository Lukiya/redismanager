import React from 'react'
import { IRedisEntry, IEntryTableModelState, ILayoutModelState, connect, Loading, Dispatch } from 'umi';
import { Table, Dropdown, Button, Menu, Modal } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DownOutlined, RedoOutlined, ExportOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import Hotkeys from 'react-hot-keys';
import { hash } from '@/utils/sha1'
import u from '@/utils/u';
import TableComponent from '@/components/TableComponent'
import HashTable from '@/components/HashTable'
import ListTable from '@/components/ListTable'
import SetTable from '@/components/SetTable'
import ZSetTable from '@/components/ZSetTable'
import Editor from '@/components/Editor'
import Importer from '@/components/Importer';

interface IPageProps {
    model: IEntryTableModelState;
    loading: boolean;
    configs: any;
    dispatch: Dispatch;
}

class KeysPage extends TableComponent<IPageProps> {
    componentDidMount() {
        const self = this;

        // Copy
        document.oncopy = e => {
            self.props.dispatch({
                type: 'keytable/copy',

            });
        };
        // Paste
        document.onpaste = e => {
            const clipboardData = e.clipboardData;
            if (u.isNoW(clipboardData)) {
                return;
            }

            const clipboardText = clipboardData?.getData("text");
            if (u.isNoW(clipboardText) || clipboardText?.indexOf(u.CLIPBOARD_REDIS) !== 0) {
                return;
            }

            Modal.confirm({
                title: 'Paste Confirm',
                content: 'If key exists, paste data will override it, continue?',
                onOk() {
                    self.props.dispatch({
                        type: 'keytable/paste',
                        clipboardText: clipboardText,
                    });
                },
            });
        };
    }

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
                    DB: model.DB,
                    Key: record.Key,
                    Type: record.Type,
                }
            });
        }
    };

    expandedRowRender = (record: IRedisEntry) => {
        const { model } = this.props;
        const entries = model[hash(record.Key)]
        let subtable;
        subtable = <div>NOT SUPPORT</div>
        switch (record.Type) {
            case u.HASH:
                subtable = <HashTable db={model.DB} entries={entries} redisKey={record.Key} />
                break;
            case u.LIST:
                subtable = <ListTable db={model.DB} entries={entries} redisKey={record.Key} />
                break;
            case u.SET:
                subtable = <SetTable db={model.DB} entries={entries} redisKey={record.Key} />
                break;
            case u.ZSET:
                subtable = <ZSetTable db={model.DB} entries={entries} redisKey={record.Key} />
                break;
            default:
                subtable = <div>NOT SUPPORT</div>
                break;
        }
        return subtable;
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

    showEditor = (record: IRedisEntry) => {
        return {
            onClick: () => {
                const { model, dispatch } = this.props;
                dispatch({
                    type: 'editor/show',
                    payload: {
                        db: model.DB,
                        entry: {
                            Key: record.Key,
                            Type: record.Type,
                            Field: record.Field,
                            IsNew: false
                        },
                    },
                });
            },
        };
    };

    newClicked = (event: any) => {
        const { model, dispatch } = this.props;
        dispatch({
            type: 'editor/show',
            payload: {
                db: model.DB,
                entry: {
                    Type: event.key,
                    IsNew: true
                },
            },
        });
    };

    refresh = () => {
        const { model, dispatch } = this.props;
        dispatch({
            type: 'keytable/fetchEntries',
            payload: {
                DB: model.DB,
            },
        });
    };

    deleteKeys = () => {
        const { model, dispatch } = this.props;
        const hasSelection = !u.isNoW(model.SelectedEntries) && model.SelectedEntries.length > 0;
        if (!hasSelection) return;

        Modal.confirm({
            title: 'Do you want to delete selected keys?',
            content: 'This operation cannot be undone.',
            onOk() {
                dispatch({
                    type: 'keytable/deleteKeys',
                });
            },
        });
    };

    exportFile = () => {
        this.props.dispatch({
            type: 'keytable/exportFile',
        });
    }

    onShowSizeChange = (oldSize: number, newSize: number) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'keytable/setState',
            payload: {
                PageSize: newSize,
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
            ...this.getColumnSearchProps("Key"),
            onCell: this.showEditor,
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
                <Menu.Item key="string" onClick={this.newClicked}>string</Menu.Item>
                <Menu.Item key="hash" onClick={this.newClicked}>hash</Menu.Item>
                <Menu.Item key="list" onClick={this.newClicked}>list</Menu.Item>
                <Menu.Item key="set" onClick={this.newClicked}>set</Menu.Item>
                <Menu.Item key="zset" onClick={this.newClicked}>zset</Menu.Item>
            </Menu>
        );

        const hasSelection = !u.isNoW(model.SelectedEntries) && model.SelectedEntries.length > 0;

        return (
            <div>
                <div className="toolbar">
                    <Dropdown overlay={menu}>
                        <Button size="small" type="primary"><FileAddOutlined /> New <DownOutlined /></Button>
                    </Dropdown>
                    <Button size="small" type="default" title="Refresh" onClick={this.refresh}><RedoOutlined /></Button>
                    <Importer db={model.DB} selectedDB={model.DB} />
                    <Button size="small" type="default" title="Export" disabled={!hasSelection} onClick={this.exportFile}><ExportOutlined /></Button>
                    <Button size="small" type="primary" danger title="Delete" disabled={!hasSelection} onClick={this.deleteKeys}><DeleteOutlined /></Button>
                </div>

                <Hotkeys keyName="del" onKeyUp={this.deleteKeys.bind(document)} filter={(e: any) => {
                    return u.isNoW(e.target.type) || e.target.type === "checkbox";
                }} />

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
                    pagination={{ pageSize: model.PageSize, hideOnSinglePage: true, onShowSizeChange: this.onShowSizeChange }}
                    bordered={true}
                    size="small"
                />

                <Editor />
            </div>
        );
    }
}

export default connect(({ layout, keytable, loading }: { layout: ILayoutModelState; keytable: IEntryTableModelState; loading: Loading }) => ({
    model: keytable,
    configs: layout.Configs,
    loading: loading.models.keytable,
}))(KeysPage);