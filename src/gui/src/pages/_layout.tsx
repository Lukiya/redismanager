import { DatabaseOutlined, CloudServerOutlined, QuestionCircleOutlined, GithubOutlined } from '@ant-design/icons';
import logo from "@/assets/logo.svg"
import { connect, Link, useModel } from 'umi';
import { Layout, Menu, Spin, Button, Popover, Space } from 'antd';
import { useEffect } from 'react';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function buildMenu(dispatch: any, menuState: any) {
    const dbs = menuState.server.DBs;
    const dbMenus = [];

    for (let i = 0; i < dbs.length; i++) {
        const db = dbs[i];
        const dbStr = "db" + db.DB;
        const key = db.DB.toString();
        const dbMenu = <Menu.Item key={key} icon={<DatabaseOutlined />}><Link to={"/" + menuState.server.ID + "/" + db.DB}>{dbStr}</Link></Menu.Item>
        dbMenus.push(dbMenu);
    }


    return (
        <Menu title="Test" theme="dark" mode="inline"
            // openKeys={menuState.openKeys} onOpenChange={(openKeys) => dispatch({ type: "menuVM/setOpenKeys", openKeys })}
            selectedKeys={menuState.selectedKeys}
        >
            {dbMenus}
        </Menu >
    );
}

const LayoutPage = (props: any) => {
    const { menuState, dispatch, loading } = props;
    useEffect(() => dispatch({ type: "menuVM/init" }), []);
    const { initialState } = useModel('@@initialState');

    let menu: any;
    if (loading) {
        menu = <div style={{ textAlign: "center", marginTop: "20px" }}><Spin /></div>
    } else {
        menu = menuState.server.DBs && menuState.server.DBs.length > 0 ? (
            <div>
                <h1 style={{ color: "white" }}><CloudServerOutlined /> {menuState.server.Name}</h1>
                {buildMenu(dispatch, menuState)}
            </div>
        ) : null;
    }

    const tipsLI = [
        <li key="1">Ctrl+C&nbsp;: Copy selection(s)</li>,
        <li key="2">Ctrl+V&nbsp;: Paste</li>,
        <li key="3">Delete&nbsp;: Delete selection(s)</li>,
    ];
    const tipsUL = <ul className="ulist">{tipsLI}</ul>


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider breakpoint="lg" collapsedWidth="0">
                <div style={{ paddingTop: "17px", paddingBottom: "17px", textAlign: "center" }}><Link to="/" style={{ color: "#fff", }}><img src={logo} alt="logo" style={{ width: "30px" }} /> Redis Manager {initialState?.info.version}</Link></div>
                {menu}
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }}>
                    <Space>
                        <Popover content={tipsUL} trigger="focus">
                            <Button size="small" type="dashed" className="tips"><QuestionCircleOutlined /> Help</Button>
                        </Popover>
                        <Button size="small" type="dashed" className="tips" href="https://github.com/Lukiya/redismanager" target="_blank"><GithubOutlined /> Github</Button>
                    </Space>
                </Header>
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