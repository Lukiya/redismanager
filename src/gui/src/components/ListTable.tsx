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
    dispatch: Dispatch
}

class ListTable extends TableComponent<IPageProps> {
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
            render: (_, record) => <Button type="danger" size="small" title="Delete" onClick={() => this.deleteMember(record)}><DeleteOutlined /></Button>,
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
                rowKey="Key"
                className="sublist"
                columns={this._columns}
                dataSource={entries}
                pagination={{ pageSize: pageSize, hideOnSinglePage: true }}
                bordered={true}
                size="small"
            />
        );
    }
}

export default connect(({ layout, keytable }: { layout: ILayoutModelState; keytable: IEntryTableModelState }) => ({
    model: keytable,
    configs: layout.Configs,
}))(ListTable);