import { defineConfig } from 'umi';

export default defineConfig({
  title:"Redis Manager v1.2.1",
  history: { type: 'hash' },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', component: '@/pages/dashboard' },
        { path: '/db/:id', component: '@/pages/keyspage' },
      ]
    }
  ],
});
