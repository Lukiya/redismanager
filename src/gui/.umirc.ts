import { defineConfig } from 'umi';

export default defineConfig({
  history: { type: 'hash' },
  nodeModulesTransform: {
    type: 'none',
  },
  // routes: [
  //   { path: '/', component: '@/pages/index' },
  // ],
  fastRefresh: {},
  antd: {
    // dark: true,
    compact: true,
  },
  dva: {
    // immer: true,
    // hmr: false,
  },
  layout: {
    name: 'Redis Manager',
    // locale: `zh-CN`,
    // layout: 'side',
    // layout: 'mix',
    navTheme: 'light',
    // 拂晓蓝
    // primaryColor: '#1890ff',
    // contentWidth: 'Fluid',
    // breakpoint: 'md',
    // fixedHeader: false,
    // fixSiderbar: true,
    // colorWeak: false,
    // title: 'Dreamvat Admin',
    // pwa: false,
    // logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    // iconfontUrl: '',
    // headerRender: false,
    // menuHeaderRender: false,
    // contentStyle: { minHeight: '95vh' },
    contentStyle: { paddingBottom: '24px' },
  },
  locale: {
    default: 'en-US',
    antd: true,
  },
  dynamicImport: {},
});
