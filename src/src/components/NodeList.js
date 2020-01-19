import React, { Component } from 'react';
import { connect } from 'dva';
import u from '../utils/utils'

class NodeList extends Component {
    componentDidMount() {
        this.getConfigs()
    }

    getConfigs = () => {
        this.props.dispatch({
            type: 'layout/getConfigs',
        });
    };

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


function mapStateToProps(state) {
    const s = state["layout"]
    return { configs: s.configs };
}

export default connect(mapStateToProps)(NodeList)