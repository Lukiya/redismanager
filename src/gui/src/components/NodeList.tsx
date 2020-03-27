import React from 'react';
import u from '@/utils/u'
import { Button, Popover } from 'antd';
import { GoldOutlined } from '@ant-design/icons';

export default (props: any) => {
    let addrs = []
    if (!u.isNoW(props.configs) && !u.isNoW(props.configs.Redis)) {
        addrs = props.configs.Redis.Addrs;
    }

    const nodes = [];
    for (let i = 0; i < addrs.length; i++) {
        nodes.push(<li key={i}>{addrs[i]}</li>);
    }
    const nodesList = <ul className="nodeList">{nodes}</ul>

    return (
        <Popover content={nodesList} trigger="focus">
            <Button type="dashed"><GoldOutlined /> Nodes</Button>
        </Popover>
    )
}