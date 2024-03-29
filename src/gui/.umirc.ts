import { defineConfig } from 'umi';

export default defineConfig({
  history: { type: 'hash' },
  outputPath: "../../src/host/wwwroot",
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      exact: false, path: '/', component: '@/pages/_layout',
      routes: [
        { path: '/', component: '@/pages/dashboard' },
        { path: '/:serverID/:db', component: '@/pages/[serverID]/[keyList]' },
      ]
    }
  ],
  fastRefresh: {},
  antd: {
    // dark: true,
    compact: true,
  },
  dva: {
    // immer: true,
    // hmr: false,
  },
  // layout: {
  //   name: 'Redis Manager',
  //   // locale: `zh-CN`,
  //   // layout: 'side',
  //   // layout: 'mix',
  //   navTheme: 'dark',
  //   // 拂晓蓝
  //   // primaryColor: '#1890ff',
  //   // contentWidth: 'Fluid',
  //   // breakpoint: 'md',
  //   // fixedHeader: false,
  //   // fixSiderbar: true,
  //   // colorWeak: false,
  //   // title: 'Dreamvat Admin',
  //   // pwa: false,
  //   // logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  //   // iconfontUrl: '',
  //   // headerRender: false,
  //   // menuHeaderRender: false,
  //   // contentStyle: { minHeight: '95vh' },
  //   contentStyle: { paddingBottom: '24px' },
  // },
  locale: {
    default: 'en-US',
    antd: true,
  },
  dynamicImport: {},
  mfsu: {}
});
