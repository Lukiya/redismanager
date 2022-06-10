import { DatabaseOutlined, CloudServerOutlined, QuestionCircleOutlined, GithubOutlined, InfoCircleOutlined } from '@ant-design/icons';
import logo from "@/assets/logo.svg"
import { connect, Link, useModel } from 'umi';
import { Layout, Menu, Spin, Button, Popover, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { gt as semvergt } from 'es-semver'

const { Header, Sider } = Layout;
const { Text } = Typography;

function buildMenu(dispatch: any, menuState: any) {
    const dbs = menuState.server.DBs;
    const dbMenus = [];

    for (let i = 0; i < dbs.length; i++) {
        const db = dbs[i];
        const dbStr = "db" + db.DB;
        const key = db.DB.toString();
        // const dbMenu = <Menu.Item key={key} icon={<DatabaseOutlined />}><Link to={"/" + menuState.server.ID + "/" + db.DB}>{dbStr}</Link></Menu.Item>
        const dbMenu = {
            key: key,
            icon: <DatabaseOutlined />,
            label: <Link to={"/" + menuState.server.ID + "/" + db.DB}>{dbStr}</Link>,
        };
        dbMenus.push(dbMenu);
    }


    return (
        <Menu title="Test" theme="dark" mode="inline"
            // openKeys={menuState.openKeys} onOpenChange={(openKeys) => dispatch({ type: "menuVM/setOpenKeys", openKeys })}
            selectedKeys={menuState.selectedKeys}
            items={dbMenus}
        >
            {/* {dbMenus} */}
        </Menu >
    );
}

const LayoutPage = (props: any) => {
    const { menuState, dispatch, loading } = props;
    useEffect(() => {
        dispatch({ type: "menuVM/init" });
    }, []);
    const { initialState } = useModel('@@initialState');
    const info = initialState?.info;

    // new version check

    const hasNewVersion = semvergt(info?.liveVersion, info?.version);
    const btnUpgrade = hasNewVersion ? <Popover content={<Text type="success">New version available</Text>}>
        <Button size="small" type="dashed" className="tips" href="https://github.com/Lukiya/redismanager/releases" target="_blank"><InfoCircleOutlined /> {info.liveVersion}</Button>
    </Popover> : undefined;
    // const btnUpgrade = undefined;

    let menu: any;
    if (loading) {
        menu = <div style={{ textAlign: "center", marginTop: "20px" }}><Spin /></div>
    } else {
        menu = menuState.server.DBs && menuState.server.DBs.length > 0 ? (
            <div>
                <h1 title={menuState.server.Name} style={{ color: "white" }}><CloudServerOutlined /> {menuState.server.Name.length > 23 ? menuState.server.Name.substring(0, 20) + "..." : menuState.server.Name}</h1>
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
                <div style={{ paddingTop: "17px", paddingBottom: "17px", textAlign: "center" }}><Link to="/" style={{ color: "#fff", }}><img src={logo} alt="logo" style={{ width: "30px" }} /> Redis Manager {info?.version}</Link></div>
                {menu}
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }}>
                    <Space>
                        <Popover content={tipsUL} trigger="focus">
                            <Button size="small" type="dashed" className="tips"><QuestionCircleOutlined /> Help</Button>
                        </Popover>
                        <Button size="small" type="dashed" className="tips" href="https://github.com/Lukiya/redismanager" target="_blank"><GithubOutlined /> Github</Button>
                        {btnUpgrade}
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