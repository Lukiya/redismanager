import React, { Component } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';

class HashList extends Component {
    constructor(props) {
        super(props)

        console.log(props)
    }

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
        { title: 'Field', dataIndex: 'Field', key: 'Field' },
        { title: 'Value', dataIndex: 'Value', key: 'Value' },
    ]

    render() {
        return (
            <Table rowKey={x => x.Field}
                columns={this.columns}
                dataSource={this.props.list}
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