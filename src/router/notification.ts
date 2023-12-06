export default [
    {
        path: '/notification/new',
        name: 'NewNoticiation',
        component: () => import('../views/notification/NewNotification.vue')
    },
    {
        path: '/notification/:nid',
        name: 'NotificationDetail',
        component: () => import('../views/notification/DetailNotification.vue')
    },
    {
        path: '/organization/bulk_notifications/:oid',
        name: 'OrganizationBulkNotifications',
        component: () => import('../views/notification/OrganizationNotifications.vue')
    },
    {
        path: '/notification/statistics/:nid',
        name: 'NotificationStatistics',
        component: () => import('../views/notification/Statistics.vue')
    },
    {
        path: '/notification/published/user',
        name: 'NotificationPublishedByUser',
        component: () => import('../views/notification/MyPublished.vue')
    }
]