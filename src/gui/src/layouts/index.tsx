import React from 'react'
import { Layout, Select } from 'antd';
import { ILayoutModelState, Link, connect, Loading, Dispatch } from 'umi';
import NodeList from '@/components/NodeList';
import DBList from '@/components/DBList';
import HelpButton from '@/components/HelpButton';
import './index.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

interface IPageProps {
    model: ILayoutModelState;
    // loading: boolean;
    dispatch: Dispatch;
}

class AppLayout extends React.Component<IPageProps> {
    componentDidMount() {
        this.props.dispatch({
            type: 'layout/load',
        });
    }

    OnServerChanged = (id: string) => {
        this.props.dispatch({
            type: 'layout/selectServer',
            payload: {
                ID: id,
            }
        });
    };

    render() {
        const { model } = this.props;
        const logo = <div className="logo"><Link to="/">Redis Manager</Link></div>;

        if (model.Servers.length > 0) {
            const options = [];
            for (let i = 0; i < model.Servers.length; i++) {
                const server = model.Servers[i];
                options.push(<Option key={server.ID} value={server.ID}>{server.Name}</Option>);
            }
            const selectedID = model.Servers[0].ID;

            return (
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider breakpoint="lg" collapsedWidth="0">
                        {logo}
                        <Select value={selectedID} style={{ width: "168px", margin: "0 16px" }} onChange={this.OnServerChanged}>
                            {options}
                        </Select>,
                        <DBList dbs={model.DBs} selectedKeys={['|' + model.SelectedDB + '|']} />
                    </Sider>
                    <Layout className="layout">
                        <Header className="header">
                            <HelpButton />
                            {/* <NodeList configs={model.Configs} /> */}
                        </Header>
                        <Content className="content">
                            {this.props.children}
                        </Content>
                    </Layout>
                </Layout>
            );
        } else {
            return (
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider breakpoint="lg" collapsedWidth="0">
                        {logo}
                    </Sider>
                    <Layout className="layout">
                        <Header className="header">
                            <HelpButton />
                        </Header>
                        <Content className="content">
                            {this.props.children}
                        </Content>
                    </Layout>
                </Layout>
            );
        }
    }
}

// export default connect(({ layout, loading }: { layout: ILayoutModelState; loading: Loading }) => ({
export default connect(({ layout }: { layout: ILayoutModelState; }) => ({
    model: layout,
    // loading: loading.models.layout,
}))(AppLayout);