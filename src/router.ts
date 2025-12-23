import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import Viewer from './views/Viewer.vue';
import Viewer2 from './views/Viewer2.vue';
import ListView from './views/ListView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/contents/:contentsId/list',
      name: 'list',
      component: ListView,
    },
    {
      path: '/contents/:contentsId/:page',
      name: 'home2',
      component: Viewer,
    },
    {
      path: '/viewer',
      name: 'viewer2',
      component: Viewer2,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/AboutView.vue'),
    },
  ],
});

export default router;
