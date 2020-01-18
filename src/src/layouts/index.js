import React, { Component } from 'react';
import styles from './index.css';
import { Layout } from 'antd';
import Link from 'umi/link';
import DBList from '../components/DBList'
import NodeList from '../components/NodeList'

const { Header, Content, Sider } = Layout;

class BaseLayout extends Component {
  render() {
    // get
    let selectedDB;
    const array = this.props.children.props.location.pathname.match(/\/db\/(\d+)/)
    if (array != null && array.length > 1) {
      selectedDB = array[1]
    }

    return (
      <Layout>
        <Sider breakpoint="lg" collapsedWidth="0" style={{ minHeight: '100vh' }}>
          <div className={styles.logo}><Link to="/">Redis Manager</Link></div>
          <DBList selectedDB={selectedDB} />
        </Sider>
        <Layout >
          <Header style={{ background: '#f0f2f5' }}>
            <NodeList />
          </Header>
          <Content>
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default BaseLayout