import React from 'react'
import { IRedisEntry, ILayoutModelState, connect } from 'umi';
import { Table, Button } from 'antd'
import { ColumnProps } from 'antd/es/table';
import { DeleteOutlined } from '@ant-design/icons';
import u from '@/utils/u';

interface IPageProps {
    configs: any;
    entries: [];
}

class ZSetTable extends React.Component<IPageProps> {
    _columns: ColumnProps<IRedisEntry>[] = [
        {
            title: 'Score',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            // onCell: this.onCell,
            className: "pointer",
            sorter: (a, b) => a.Field - b.Field,
            // ...this.getColumnSearchProps('Field'),
        },
        {
            title: 'Member',
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

export default connect(({ layout, }: { layout: ILayoutModelState; }) => ({
    configs: layout.Configs,
}))(ZSetTable);