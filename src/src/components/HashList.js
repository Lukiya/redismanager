import React, { Component } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';
import u from '../utils/utils'

class HashList extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.key !== this.props.key) {
            this.getHashList()
        }
    }

    componentDidMount() {
        this.getHashList()
    }

    getHashList = () => {
        this.props.dispatch({
            type: 'hash/getHashList',
            redisKey: this.props.redisKey
        });
    };

    columns = [
        {
            title: 'Field',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.Field.localeCompare(b.Field),
            className: "field",
        },
        {
            title: 'Value',
            dataIndex: 'Value',
            key: 'Value',
            className: "value",
        },
    ]

    render() {
        const data = []
        if (!u.isNoW(this.props.list)) {
            var list = this.props.list[this.props.redisKey]
            if (!u.isNoW(list)) {
                for (var key in list) {
                    data.push({ "Field": key, "Value": list[key] })
                }
            }
        }
        return (
            <Table rowKey={x => x.Field}
                className="sublist"
                columns={this.columns}
                dataSource={data}
                pagination={{ pageSize: 5 }}
                size="small"
                loading={this.props.isBusy} />
        )
    }
}

function mapStateToProps(state) {
    const s = state["hash"]
    return { list: s.list, isBusy: s.isBusy };
}

export default connect(mapStateToProps)(HashList)