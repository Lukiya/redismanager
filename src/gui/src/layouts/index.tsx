import React from 'react'
import { Layout } from 'antd';
import { ILayoutModelState, Link, connect, Dispatch } from 'umi';
import NodeList from '@/components/NodeList'
import DBList from '@/components/DBList'
import './index.css';

const { Header, Sider, Content } = Layout;

interface IPageProps {
    model: ILayoutModelState;
    dispatch: Dispatch;
}

class AppLayout extends React.Component<IPageProps> {
    componentDidMount() {
        this.props.dispatch({
            type: 'layout/load',
        });
    }

    render() {
        const { model } = this.props;
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider breakpoint="lg" collapsedWidth="0">
                    <div className="logo"><Link to="/">Redis Manager</Link></div>
                    <DBList dbs={model.DBs} selectedKeys={['|' + model.SelectedDB + '|']} />
                </Sider>
                <Layout className="site-layout">
                    <Header className="site-layout-background" style={{ padding: 0 }}>
                        <NodeList configs={model.Configs} />
                    </Header>
                    <Content className="site-layout-background" style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                    }}
                    >
                        {this.props.children}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default connect(({ layout }: { layout: ILayoutModelState; }) => ({
    model: layout,
}))(AppLayout);