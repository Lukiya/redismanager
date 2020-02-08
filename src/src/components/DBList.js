import React, { Component } from 'react';
import { connect } from 'dva';
import { Menu, Icon } from 'antd';
import Link from 'umi/link';
import u from '../utils/utils';

class DBList extends Component {
    componentDidMount() {
        this.getDBs();
    }

    getDBs = () => {
        this.props.dispatch({
            type: 'layout/getDBs',
        });
    };

    render() {
        let { list } = this.props;
        if (u.isNoW(list)) {
            list = []
        }

        return (
            <div>
                < Menu theme="dark" mode="inline" selectedKeys={"|" + this.props.selectedDB + "|"}>
                    {list.map(v => <Menu.Item key={'|' + v + '|'}><Link className="pointer" to={'/db/' + v}><Icon type="database" />db{v}</Link></Menu.Item>)}
                </Menu >
            </div>
        )
    }
}

export default connect(({ layout }) => layout)(DBList)