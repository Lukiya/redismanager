import React from 'react'
import { Layout } from 'antd';
import { ILayoutModelState, Link, connect, Loading, Dispatch } from 'umi';
import NodeList from '@/components/NodeList'
import DBList from '@/components/DBList'
import HelpButton from '@/components/HelpButton';
import './index.css';

const { Header, Sider, Content } = Layout;

interface IPageProps {
    model: ILayoutModelState;
    loading: boolean;
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
                <Layout className="layout">
                    <Header className="header">
                        <HelpButton/>
                        <NodeList configs={model.Configs} />
                    </Header>
                    <Content className="content">
                        {this.props.children}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default connect(({ layout, loading }: { layout: ILayoutModelState; loading: Loading }) => ({
    model: layout,
    loading: loading.models.layout,
}))(AppLayout);