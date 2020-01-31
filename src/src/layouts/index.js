import React, { Component } from 'react';
import styles from './index.css';
import { connect } from 'dva';
import { Layout } from 'antd';
import Link from 'umi/link';
import DBList from '../components/DBList';
import NodeList from '../components/NodeList';
import u from '../utils/utils';

const { Header, Content, Sider } = Layout;

class BaseLayout extends Component {
  componentDidMount() {
    this.getConfigs()
  }

  getConfigs = () => {
    this.props.dispatch({
      type: 'layout/getConfigs',
    });
  };

  render() {
    // get
    let selectedDB;
    const array = this.props.children.props.location.pathname.match(/\/db\/(\d+)/)
    if (array != null && array.length > 1) {
      selectedDB = array[1];
    }

    let configs = {};
    if (!u.isNoW(this.props.configs)) {
      configs = this.props.configs;
    }

    return (
      <Layout>
        <Sider breakpoint="lg" collapsedWidth="0" style={{ minHeight: '100vh' }}>
          <div className={styles.logo}><Link to="/">Redis Manager</Link></div>
          <DBList selectedDB={selectedDB} />
        </Sider>
        <Layout >
          <Header style={{ background: '#f0f2f5' }}>
            <NodeList configs={configs} newClicked={() => { console.log(2222) }} />
          </Header>
          <Content>
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const s = state["layout"];
  return { configs: s.configs };
}

export default connect(mapStateToProps)(BaseLayout)