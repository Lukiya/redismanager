import ProLayout, { MenuDataItem } from '@ant-design/pro-layout';
import logo from "@/assets/logo.svg"
import { connect, Link } from 'umi';
import { Layout, Menu, Breadcrumb } from 'antd';
import { useEffect } from 'react';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function buildMenu(dispatch: any, menuState: any) {
    const nodes = menuState.cluster.Nodes;

    const nodeMenus = [];

    for (const nodeKey in nodes) {
        const node = nodes[nodeKey];
        const dbMenus = [];

        for (const dbKey in node.DBs) {
            const db = "db" + dbKey;

            const dbMenu = <Menu.Item key={db} ><Link to={"/" + db}>{db}</Link></Menu.Item>;

            dbMenus.push(dbMenu);
        }

        const nodeMenu = <SubMenu key={node.ID} title={node.Addr}>{dbMenus}</SubMenu>;
        nodeMenus.push(nodeMenu);
    }


    if (nodeMenus.length > 0) {
        return <Menu theme="dark" openKeys={menuState.openKeys} mode="inline" onOpenChange={(openKeys: any) => dispatch({ type: "menuVM/setOpenKeys", openKeys })}> {nodeMenus}</Menu >;
    } else {
        return null;
    }
}

const LayoutPage = (props: any) => {
    const { menuState, dispatch } = props;
    useEffect(() => dispatch({ type: "menuVM/GetCluster", clusterID: "selected" }), []);

    const menu = buildMenu(dispatch, menuState);

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

// export default connect(({ menuVM, loading }: any) => ({
export default connect(({ menuVM }: any) => ({
    menuState: menuVM,
    // loading: loading.models.menuVM,
}))(LayoutPage);