import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: { render: () => null } },
    { path: '/admin', name: 'admin', component: { render: () => null } },
  ],
});

export default router;
