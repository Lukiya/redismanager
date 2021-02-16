import TableComponent from '@/components/TableComponent';
import { Breadcrumb, Button, Divider, Dropdown, Form, Input, Space, Table, Tooltip } from 'antd';
import { DownOutlined, HomeOutlined, EditOutlined, DeleteOutlined, FileAddOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { connect, Dispatch, IEntryTableModelState, ILayoutModelState, Loading } from 'umi';
import styles from './dashboard.css';
import { ColumnProps } from 'antd/lib/table';
import ServerEditor from '@/components/ServerEditor';
import TextArea from 'antd/lib/input/TextArea';

interface IPageProps {
  model: ILayoutModelState;
  loading: boolean;
  dispatch: Dispatch;
}

class Dashboard extends React.Component<IPageProps> {

  showEditor = (record: any) => {
    this.props.dispatch({
      type: 'serverEditor/show',
      payload: {
        Server: record,
      },
    });
  }

  _columns: ColumnProps<any>[] = [
    {
      title: 'Name',
      dataIndex: 'Name',
      // defaultSortOrder: "ascend",
      // sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
      // ...this.getColumnSearchProps("Key"),
      // onCell: this.showEditor,
      // className: "pointer",
    },
    {
      title: 'Server Node(s)',
      dataIndex: 'Addrs',
      render: addrs => <span>{addrs.join(", ")}</span>,
      // defaultSortOrder: "ascend",
      // sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
      // ...this.getColumnSearchProps("Key"),
      // onCell: this.showEditor,
      // className: "pointer",
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'Type',
    //   sorter: (a: any, b: any) => a.Type.localeCompare(b.Type),
    //   width: 100,
    //   filters: [{ text: 'hash', value: 'hash' }, { text: 'string', value: 'string' }, { text: 'list', value: 'list' }, { text: 'set', value: 'set' }, { text: 'zset', value: 'zset' }],
    //   onFilter: (value: any, record: any) => record.Type.includes(value),
    // },
    // {
    //   title: 'Length',
    //   dataIndex: 'Length',
    //   width: 100,
    //   align: "right",
    //   sorter: (a: any, b: any) => a.Length - b.Length,
    // },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: "right",
      render: (_, record) => (
        <Space size="small" direction="horizontal">
          <Button size="small" type="primary" title="Edit" onClick={() => this.showEditor(record)}><EditOutlined /></Button>
          <Button size="small" type="primary" danger title="Delete"><DeleteOutlined /></Button>
        </Space>
      ),
    },
  ];

  render() {
    const { model } = this.props;
    return (
      <div>
        <div className="toolbar">
          <Button size="small" type="primary"><FileAddOutlined /> New Server(s)</Button>
          {/* <Button size="small" type="default" title="Refresh" onClick={this.refresh}><RedoOutlined /></Button>
          <Button size="small" type="default" title="Export" disabled={!hasSelection} onClick={this.exportFile}><ExportOutlined /></Button>
          <Button size="small" type="primary" danger title="Delete" disabled={!hasSelection} onClick={this.deleteKeys}><DeleteOutlined /></Button> */}
        </div>
        <Table
          rowKey="ID"
          dataSource={model.Servers}
          columns={this._columns}
          bordered={true}
          size="small"
        />

        <ServerEditor />
      </div>
    );
  }
}

export default connect(({ layout, loading }: { layout: ILayoutModelState; loading: Loading }) => ({
  model: layout,
  loading: loading.models.keytable,
}))(Dashboard);