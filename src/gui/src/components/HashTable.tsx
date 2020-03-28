import React from 'react'
import { IRedisEntry, IEntryTableModelState, ILayoutModelState, connect, Loading } from 'umi';
import { Table, Button } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DeleteOutlined } from '@ant-design/icons';
import u from '@/utils/u';

interface IPageProps {
    loading: boolean;
    configs: any;
    entries: [];
}

class HashTable extends React.Component<IPageProps> {
    _columns: ColumnProps<IRedisEntry>[] = [
        {
            title: 'Field',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            // onCell: this.onCell,
            className: "pointer",
            sorter: (a, b) => a.Field.localeCompare(b.Field),
            // ...this.getColumnSearchProps('Field'),
        },
        {
            title: 'Value',
            dataIndex: 'Value',
            key: 'Value',
            // onCell: this.onCell,
            className: "pointer",
            // ...this.getColumnSearchProps('Value'),
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            width: 70,
            className: "ar",
            render: () => <Button type="danger" size="small" title="Delete"><DeleteOutlined /></Button>,
        },
    ];

    render() {
        const { loading, configs, entries } = this.props;
        let pageSize = 15;
        if (!u.isNoW(configs) && !u.isNoW(configs.PageSize) && !u.isNoW(configs.PageSize.SubList)) {
            pageSize = configs.PageSize.SubList;
        }

        return (
            <Table<IRedisEntry>
                rowKey="Key"
                columns={this._columns}
                dataSource={entries}
                pagination={{ pageSize: pageSize, hideOnSinglePage: true }}
                bordered={true}
                size="small"
            />
        );
    }
}

export default connect(({ layout, loading }: { layout: ILayoutModelState; loading: Loading }) => ({
    configs: layout.Configs,
    loading: loading.models.keytable,
}))(HashTable);