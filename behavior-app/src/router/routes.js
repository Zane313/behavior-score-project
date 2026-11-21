const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('@/pages/StudentsPage.vue'),
        meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
      },
      {
        path: 'students/:id',
        name: 'studentDetail',
        component: () => import('@/pages/StudentDetailPage.vue'),
        meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
      },
      {
        path: 'records',
        name: 'records',
        component: () => import('@/pages/RecordsPage.vue'),
        meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
      },
      {
        path: 'my-score',
        name: 'myScore',
        component: () => import('@/pages/MyScorePage.vue'),
        meta: { requiresAuth: true, roles: ['student'] }
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes
