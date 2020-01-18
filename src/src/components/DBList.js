import React, { Component } from 'react';
import { connect } from 'dva';
import { Menu } from 'antd';
import Link from 'umi/link';

class DBList extends Component {
    componentDidMount() {
        this.getDBs()
    }

    getDBs = () => {
        this.props.dispatch({
            type: 'layout/getDBs',
        });
    };

    render() {
        return (
            <div>
                < Menu theme="dark" mode="inline" selectedKeys={"|" + this.props.selectedDB + "|"}>
                    {this.props.dbList.map(v => <Menu.Item key={'|' + v + '|'}><Link to={'/db/' + v}>db{v}</Link></Menu.Item>)}
                </Menu >
            </div>
        )
    }
}


function mapStateToProps(state) {
    const s = state["layout"]
    return { dbList: s.dbList };
}

export default connect(mapStateToProps)(DBList)