import ProLayout, { MenuDataItem } from '@ant-design/pro-layout';
import logo from "@/assets/logo.svg"

const menuData: MenuDataItem[] = [
    {
        name: "node1",
        children: [
            { name: "db0", path: "/db0" },
            { name: "db1", path: "/db1" },
            { name: "db2", path: "/db2" },
            { name: "db3", path: "/db3" },
        ],
    }
];

const Layout = (props: any) => {
    const { model, loading } = props;

    return (
        <ProLayout
            title="Redis Manager"
            logo={logo}
            style={{
                height: '100vh',
            }}
            // actionRef={actionRef}
            menu={{
                request: async () => {
                    return menuData;
                },
            }}
        // location={{
        //     pathname: '/welcome/welcome',
        // }}
        >
            {props.children}
        </ProLayout>
    );
};

export default Layout