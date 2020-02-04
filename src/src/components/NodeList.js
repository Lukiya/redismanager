import React, { Component } from 'react';
import u from '../utils/utils'
import { Button, Popover } from 'antd';

class NodeList extends Component {
    render() {
        let addrs = []
        if (!u.isNoW(this.props.configs) && !u.isNoW(this.props.configs.Redis)) {
            addrs = this.props.configs.Redis.Addrs;
        }

        const nodes = [];
        for (let i = 0; i < addrs.length; i++) {
            nodes.push(<li key={i}>{addrs[i]}</li>);
        }
        const nodesList = <ul className="nodeList">{nodes}</ul>

        return (
            <Popover content={nodesList} trigger="focus">
                <Button type="dashed" icon="gold">Nodes</Button>
            </Popover>
        )
    }
}

export default NodeList