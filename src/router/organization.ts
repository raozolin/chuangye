export default [
    {
        path: '/organization/new',
        name: 'NewOrganization',
        component: () => import('../views/organization/NewOrganization.vue')
    },
    {
        path: '/organization/nearby',
        name: 'NearbyOrganization',
        component: () => import('../views/organization/Nearby.vue')
    },
    {
        path: '/organization/search',
        name: 'SearchOrganization',
        component: () => import('../views/organization/Search.vue')
    },
    {
        path: '/organization/detail/:oid',
        name: 'Organization',
        component: () => import('../views/organization/PublicDetail.vue')
    },
    {
        path: '/organization/join_request/:oid',
        name: 'OrganizationJoinRequest',
        component: () => import('../views/organization/WaitingList.vue')
    },
    {
        path: '/organization/settings/:oid',
        name: 'OrganizationSettings',
        component: () => import('../views/organization/Settings.vue')
    },
    {
        path: '/organization/profile/:oid',
        name: 'OrganizationProfile',
        component: () => import('../views/organization/EditProfile.vue')
    },
    {
        path: '/organization/members/:oid',
        name: 'OrganizationMembers',
        component: () => import('../views/organization/Members.vue')
    },
    {
        path: '/organization/official/:oid',
        name: 'OrganizationOfficial',
        component: () => import('../views/organization/Official.vue')
    },
    {
        path: '/organization/categories',
        name: 'OrganizationCategories',
        component: () => import('../views/organization/Categories.vue')
    },
    {
        path: '/organization/types',
        name: 'OrganizationTypes',
        component: () => import('../views/organization/Types.vue')
    },
    {
        path: '/organization/sub/:oid/:sub_oid',
        name: 'OrganizationSub',
        component: () => import('../views/organization/SubOrganizationMember.vue')
    },
    {
        path: '/organization/invite/:oid',
        name: 'OrganizationInvite',
        component: () => import('../views/organization/Invite.vue')
    },
    {
        path: '/organization/notifications/:oid',
        name: 'OrganizationNotifications',
        component: () => import('../views/organization/Notifications.vue')
    }
]