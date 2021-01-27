import React from 'react'
import { IRedisEntry, ILayoutModelState, connect, Dispatch, IMemberTableModelState } from 'umi';
import { Table, Button, Modal } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DeleteOutlined } from '@ant-design/icons';
import u from '@/utils/u';
import TableComponent from './TableComponent';

interface IPageProps {
    model: any;
    db: number;
    configs: any;
    entries: [];
    redisKey: string;
    dispatch: Dispatch;
}

class ListTable extends TableComponent<IPageProps> {
    showEditor = (record: IRedisEntry) => {
        return {
            onClick: () => {
                const { db, dispatch } = this.props;
                dispatch({
                    type: 'editor/show',
                    payload: {
                        db: db,
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
        const { redisKey, db, dispatch } = this.props;
        dispatch({
            type: 'editor/show',
            payload: {
                db: db,
                entry: {
                    Key: redisKey,
                    Type: u.LIST,
                    IsNew: true,
                },
            },
        });
    };

    onShowSizeChange = (oldSize: number, newSize: number) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'membertable/setState',
            payload: {
                PageSize: newSize,
            },
        });
    };

    _columns: ColumnProps<IRedisEntry>[] = [
        {
            title: 'Index',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            onCell: this.showEditor,
            className: "pointer",
            sorter: (a, b) => a.Field - b.Field,
            ...this.getColumnSearchProps('Field'),
        },
        {
            title: 'Value',
            dataIndex: 'Value',
            key: 'Value',
            onCell: this.showEditor,
            className: "pointer",
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
        const { entries, model } = this.props;

        return (
            <Table<IRedisEntry>
                rowKey="Field"
                className="sublist"
                columns={this._columns}
                dataSource={entries}
                pagination={{ pageSize: model.PageSize, hideOnSinglePage: true, onShowSizeChange: this.onShowSizeChange }}
                bordered={true}
                title={() => <Button type="primary" size="small" onClick={this.addMember}>Add</Button>}
                size="small"
            />
        );
    }
}

export default connect(({ layout, membertable }: { layout: ILayoutModelState; membertable: IMemberTableModelState }) => ({
    model: membertable,
    configs: layout.Configs,
}))(ListTable);