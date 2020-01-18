import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Icon } from 'antd';
import Highlighter from 'react-highlight-words';

class KeyList extends Component {
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
            payload: this.props.db
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

    state = {
        searchText: '',
        searchedColumn: '',
    };

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
        return (
            <Table rowKey={x => x.Key}
                rowSelection={this.rowSelection}
                columns={this.columns}
                dataSource={this.props.keyList}
                size="small"
                pagination={{ pageSize: 19 }}
                loading={this.props.isBusy} />
        )
    }
}


function mapStateToProps(state) {
    const s = state["db"]
    return { keyList: s.keyList, isBusy: s.isBusy };
}

export default connect(mapStateToProps)(KeyList)