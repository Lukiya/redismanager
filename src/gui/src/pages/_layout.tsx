import { DatabaseOutlined, CloudServerOutlined } from '@ant-design/icons';
import logo from "@/assets/logo.svg"
import { connect, Link } from 'umi';
import { Layout, Menu, Spin } from 'antd';
import { useEffect } from 'react';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function buildMenu(dispatch: any, menuState: any) {
    const nodes = menuState.cluster.Nodes;
    const nodeMenus = [];

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dbMenus = [];

        for (let i = 0; i < node.DBs.length; i++) {
            const db = node.DBs[i];
            const dbStr = "db" + db.DB;

            const dbMenu = <Menu.Item key={db.ID} icon={<DatabaseOutlined />}><Link to={"/" + menuState.cluster.ID + "/" + node.ID + "/" + dbStr}> {dbStr}</Link></Menu.Item>;

            dbMenus.push(dbMenu);
        }

        const nodeMenu = <SubMenu key={node.ID} title={node.Addr}> {dbMenus}</SubMenu>;
        nodeMenus.push(nodeMenu);
    }

    return (
        <Menu title="Test" theme="dark" openKeys={menuState.openKeys} mode="inline" onOpenChange={(openKeys: any) => dispatch({ type: "menuVM/setOpenKeys", openKeys })}>
            {nodeMenus}
        </Menu >
    );
}

const LayoutPage = (props: any) => {
    const { menuState, dispatch, loading } = props;
    useEffect(() => dispatch({ type: "menuVM/build" }), []);

    let menu: any;
    if (loading) {
        menu = <div style={{ textAlign: "center", marginTop: "20px" }}><Spin /></div>
    } else {
        menu = menuState.cluster.Nodes && menuState.cluster.Nodes.length > 0 ? (
            <div>
                <h1 style={{ color: "white" }}><CloudServerOutlined /> {menuState.cluster.Name}</h1>
                {buildMenu(dispatch, menuState)}
            </div>
        ) : null;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider breakpoint="lg" collapsedWidth="0">
                <div style={{ paddingTop: "17px", paddingBottom: "17px", textAlign: "center" }}><Link to="/" style={{ color: "#fff", }}><img src={logo} style={{ width: "30px" }} /> Redis Manager</Link></div>
                {menu}
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }} />
                {props.children}
            </Layout>
        </Layout >
    );
};

export default connect(({ menuVM, loading }: any) => ({
    // export default connect(({ menuVM }: any) => ({
    menuState: menuVM,
    loading: loading.models.menuVM,
}))(LayoutPage);