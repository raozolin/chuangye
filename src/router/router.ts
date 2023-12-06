import {
    createRouter,
    createWebHistory,
    RouteRecordRaw
} from 'vue-router'

import userRoutes from './user'
import organizationRoutes from './organization'
import notificationRoutes from './notification'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Index',
        component: () => import('../views/Index.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { allowQuit: true }
    },
    {
        path: '/logout',
        name: 'Logout',
        component: () => import('../views/Logout.vue'),
        meta: { allowQuit: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
    },
    {
        path: '/redirect',
        name: 'Redirect',
        component: () => import('../views/Redirect.vue')
    },
    {
        path: '/user',
        name: 'User',
        component: () => import('../views/user/Index.vue'),
        children: userRoutes
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../views/Search.vue')
    },
    {
        path: '/notification',
        name: 'Notification',
        component: () => import('../views/Notification.vue'),
        meta: { allowQuit: true }
    },
    {
        path: '/task',
        name: 'Task',
        component: () => import('../views/Task.vue'),
        meta: { allowQuit: true }
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { allowQuit: true, keepAlive: true }
    },
    {
        path: '/www',
        name: 'www',
        component: () => import('../views/Test.vue')
    },
    {
        path: '/messages',
        name: 'Messages',
        component: () => import('../views/Message.vue')
    },
    {
        path: '/introduction',
        name: 'introduction',
        component: () => import('../views/Introduction.vue')
    },
    {
        path: '/welcome',
        name: 'welcome',
        component: () => import('../views/Welcome.vue')
    },
    {
        path: '/organization_list',
        name: 'OrganizationList',
        component: () => import('../views/Organization.vue'),
        meta: { allowQuit: true, keepAlive: true }
    },
    {
        path: '/scanner',
        name: 'scanner',
        component: () => import('../views/Scanner.vue')
    },
    ...organizationRoutes,
    ...notificationRoutes,
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        redirect: '/notification'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router