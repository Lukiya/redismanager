import React, { Component } from 'react';
import u from '../utils/utils'

class NodeList extends Component {
    render() {
        let addrs = []
        if (!u.isNoW(this.props.configs) && !u.isNoW(this.props.configs.Redis)) {
            addrs = this.props.configs.Redis.Addrs
        }

        return (
            <div>{addrs.map((v, i) => i < addrs.length - 1 ? v + ", " : v)}</div>
        )
    }
}

export default NodeList