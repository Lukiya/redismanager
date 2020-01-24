import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Icon } from 'antd';
import Highlighter from 'react-highlight-words';
import HashTable from './HashTable'
import ListTable from './ListTable'
import SetTable from './SetTable'
import ZSetTable from './ZSetTable'
import Editor from './Editor'
import u from '../utils/utils'

class KeyTable extends Component {
    state = {
        searchText: '',
        searchedColumn: '',
        subList: [],
    };

    componentDidUpdate(prevProps) {
        if (prevProps.db !== this.props.db) {
            this.getKeys()
        }
    }
    componentDidMount() {
        this.getKeys()
    }

    getKeys = () => {
        this.props.dispatch({
            type: 'db/getKeys',
            db: this.props.db
        });
    };

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
            Key: record.Key,
        }),
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
            </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
            </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                    text
                ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    rowClassName = (record, i) => {
        if (record.Type === "string") {
            return "str_row pointer"
        } else {
            return "pointer"
        }
    };

    showEditor = (record) => {
        this.props.dispatch({
            type: 'db/showEditor',
            entry: { Key: record.Key },
        });
    }

    hideEditor = () => {
        this.props.dispatch({
            type: 'db/hideEditor'
        });
    }

    onRow = (record) => {
        return {
            onClick: event => this.showEditor(record), // 点击行
            // onDoubleClick: event => { },
            // onContextMenu: event => { },
            // onMouseEnter: event => { }, // 鼠标移入行
            // onMouseLeave: event => { },
        };
    };

    expandedRowRender = record => {
        return (
            this.state.subList[record.Key]
        )
    };

    onExpand = (expanded, record) => {
        let comp = null
        if (expanded) {
            switch (record.Type) {
                case "hash":
                    comp = <HashTable redisKey={record.Key} />
                    break
                case "list":
                    comp = <ListTable redisKey={record.Key} />
                    break
                case "set":
                    comp = <SetTable redisKey={record.Key} />
                    break
                case "zset":
                    comp = <ZSetTable redisKey={record.Key} />
                    break
                default:
                    break
            }
        }
        this.setState({
            subList: {
                ...this.state.subList,
                [record.Key]: comp,
            }
        })
    };

    columns = [
        {
            title: 'Key',
            dataIndex: 'Key',
            key: 'Key',
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.Key.localeCompare(b.Key),
            ...this.getColumnSearchProps('Key'),
        },
        {
            title: 'Type',
            dataIndex: 'Type',
            sorter: (a, b) => a.Type.localeCompare(b.Type),
            width: 100,
            filters: [{ text: 'hash', value: 'hash' }, { text: 'string', value: 'string' }, { text: 'list', value: 'list' }, { text: 'set', value: 'set' }, { text: 'zset', value: 'zset' }],
            onFilter: (value, record) => record.Type.includes(value),
        },
        {
            title: 'Length',
            dataIndex: 'Length',
            width: 100,
            align: "right",
            sorter: (a, b) => a.Length - b.Length,
        },
        {
            title: 'TTL',
            dataIndex: 'TTL',
            width: 100,
            align: "right",
            sorter: (a, b) => a.TTL - b.TTL,
        },
    ];


    render() {
        let pageSize = 15
        if (!u.isNoW(this.props.configs) && !u.isNoW(this.props.configs.PageSize) && !u.isNoW(this.props.configs.PageSize.KeyList)) {
            pageSize = this.props.configs.PageSize.KeyList
        }
        return (
            <div>
                <Table rowKey={x => x.Key}
                    onRow={this.onRow}
                    rowSelection={this.rowSelection}
                    columns={this.columns}
                    dataSource={this.props.list}
                    expandedRowRender={this.expandedRowRender}
                    onExpand={this.onExpand}
                    rowClassName={this.rowClassName}
                    size="small"
                    pagination={{ pageSize: pageSize }}
                    loading={this.props.isBusy} />
                <Editor editingEntry={this.props.editingEntry}
                    onClose={this.hideEditor}
                    visible={this.props.editorVisible} />
            </div>
        )
    }
}


function mapStateToProps(state) {
    const s = state["db"]
    const layout = state["layout"]
    return { list: s.list, isBusy: s.isBusy, configs: layout.configs, editingEntry: s.editingEntry, editorVisible: s.editorVisible };
}

export default connect(mapStateToProps)(KeyTable)