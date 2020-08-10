import React from 'react'
import { IRedisEntry, ILayoutModelState, connect, Dispatch, IEntryTableModelState } from 'umi';
import { Table, Button, Modal } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DeleteOutlined } from '@ant-design/icons';
import u from '@/utils/u';
import TableComponent from './TableComponent';

interface IPageProps {
    model: IEntryTableModelState;
    configs: any;
    entries: [];
    redisKey: string;
    dispatch: Dispatch;
}

class SetTable extends TableComponent<IPageProps> {
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

    deleteMember = (record: IRedisEntry) => {
        const { dispatch } = this.props;
        Modal.confirm({
            title: 'Do you want to delete this member?',
            content: 'This operation cannot be undone.',
            onOk() {
                dispatch({
                    type: 'keytable/deleteMembers',
                    payload: { Type: record.Type, Key: record.Key, Entries: [record] },
                });
            },
        });
    };

    addMember = () => {
        const { redisKey, model, dispatch } = this.props;
        dispatch({
            type: 'editor/show',
            payload: {
                db: model.DB,
                entry: {
                    Key: redisKey,
                    Type: u.SET,
                    IsNew: true,
                },
            },
        });
    };

    _columns: ColumnProps<IRedisEntry>[] = [
        {
            title: 'Member',
            dataIndex: 'Value',
            key: 'Value',
            onCell: this.showEditor,
            className: "pointer",
            defaultSortOrder: "ascend",
            sorter: (a, b) => b.Value.localeCompare(a.Value),
            ...this.getColumnSearchProps('Value'),
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            width: 70,
            className: "ar",
            render: (_, record) => <Button type="primary" danger size="small" title="Delete" onClick={() => this.deleteMember(record)}><DeleteOutlined /></Button>,
        },
    ];

    render() {
        const { configs, entries } = this.props;
        let pageSize = 15;
        if (!u.isNoW(configs) && !u.isNoW(configs.PageSize) && !u.isNoW(configs.PageSize.SubList)) {
            pageSize = configs.PageSize.SubList;
        }

        return (
            <Table<IRedisEntry>
                rowKey="Value"
                className="sublist"
                columns={this._columns}
                dataSource={entries}
                pagination={{ pageSize: pageSize, hideOnSinglePage: true }}
                bordered={true}
                title={() => <Button type="primary" size="small" onClick={this.addMember}>Add</Button>}
                size="small"
            />
        );
    }
}

export default connect(({ layout, keytable }: { layout: ILayoutModelState; keytable: IEntryTableModelState }) => ({
    model: keytable,
    configs: layout.Configs,
}))(SetTable);