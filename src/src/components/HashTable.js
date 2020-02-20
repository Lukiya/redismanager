import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Icon, Modal } from 'antd';
import Highlighter from 'react-highlight-words';
import u from '../utils/utils';

class HashTable extends Component {
    state = {
        searchText: '',
        searchedColumn: '',
    };

    componentDidUpdate(prevProps) {
        if (prevProps.key !== this.props.key) {
            this.getHashElements();
        }
    }

    componentDidMount() {
        this.getHashElements();
    }

    getHashElements = () => {
        this.props.dispatch({
            type: 'hash/getHashElements',
            redisKey: this.props.redisKey,
            db: this.props.selectedDB,
        });
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

    showEditor = (record) => {
        this.props.dispatch({
            type: 'editor/show',
            payload: {
                db: this.props.selectedDB,
                editingEntry: {
                    Key: this.props.redisKey,
                    Type: 'hash',
                    Field: record.Field,
                    isNew: false,
                },
            },
        });
    };

    onCell = (record) => {
        return {
            onClick: event => this.showEditor(record),
        };
    };

    addClicked = () => {
        this.props.dispatch({
            type: 'editor/show',
            payload: {
                db: this.props.selectedDB,
                editingEntry: {
                    Key: this.props.redisKey,
                    Type: 'hash',
                    isNew: true,
                },
            },
        });
    };

    deleteMember = (record) => {
        const self = this;
        Modal.confirm({
            title: 'Do you want to delete this entry?',
            content: 'This operation cannot be undone.',
            onOk() {
                self.props.dispatch({
                    type: 'hash/deleteMember',
                    db: self.props.selectedDB,
                    record,
                });
            },
        });
    };

    columns = [
        {
            title: 'Field',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            onCell: this.onCell,
            className: "pointer",
            sorter: (a, b) => a.Field.localeCompare(b.Field),
            ...this.getColumnSearchProps('Field'),
        },
        {
            title: 'Value',
            dataIndex: 'Value',
            key: 'Value',
            onCell: this.onCell,
            className: "pointer",
            ...this.getColumnSearchProps('Value'),
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (text, record) => <Button type="danger" icon="delete" size="small" onClick={() => this.deleteMember(record)} loading={this.props.isBusy} title="Delete"></Button>,
        },
    ]

    render() {
        const data = this.props.list[this.props.redisKey];

        let pageSize = 5
        if (!u.isNoW(this.props.configs) && !u.isNoW(this.props.configs.PageSize) && !u.isNoW(this.props.configs.PageSize.SubList)) {
            pageSize = this.props.configs.PageSize.SubList
        }
        const btnAdd = <Button type="primary" size="small" onClick={this.addClicked}>Add</Button>

        return (
            <Table rowKey={x => x.Field}
                className="sublist"
                columns={this.columns}
                dataSource={data}
                pagination={{ pageSize: pageSize }}
                size="small"
                title={() => btnAdd}
                loading={this.props.isBusy} />
        )
    }
}

function mapStateToProps(state) {
    const s = state["hash"]
    const layout = state["layout"]
    return { list: s.list, isBusy: s.isBusy, configs: layout.configs };
}

export default connect(mapStateToProps)(HashTable)