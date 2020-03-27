import { defineConfig } from 'umi';

export default defineConfig({
  history: { type: 'hash' },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', component: '@/pages/dashboard' },
        { path: '/db/:id', component: '@/pages/db/$id' },
      ]
    }
  ],
});
