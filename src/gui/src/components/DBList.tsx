import React from 'react';
import { Menu } from 'antd';
import { Link } from 'umi';
import u from '@/utils/u'
import { DatabaseFilled } from '@ant-design/icons';

export default (props: any) => {
    let { dbs } = props;
    if (u.isNoW(dbs)) {
        dbs = []
    }
    let { selectedKeys } = props;
    if (u.isNoW(selectedKeys)) {
        selectedKeys = []
    }
    return (
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys}>
            {dbs.map((v: number[]) => <Menu.Item key={'|' + v + '|'}><Link to={'/db/' + v}><DatabaseFilled />db{v}</Link></Menu.Item>)}
        </Menu>
    )
}