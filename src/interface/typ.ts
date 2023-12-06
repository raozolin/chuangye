

export type User = {
    id: number,
    username: string,
    email: string,
    created_at: string,
    updated_at: string,
    role: number,
    profile: {
        avatar: string,
        sign: string,
        memory: number,
        max_memory: number,
    },
}

export type OrganizationMember = {
    id: number,
    created_at: string,
    updated_at: string,
    organization_id: number,
    organization: Organization,
    user_id: number,
    user: User,
    name: string,
    role: string,
    is_manager: boolean,
}

export type Organization = {
    id: number,
    name: string,
    description: string,
    avatar: string,
    point: {
        x: number, y: number
    },
    created_at: string,
    updated_at: string,
    owner: {
        id: number,
        username: string,
    },
    profile: {
        organization_id: number,
        avatar: string,
        members: number,
        max_members: number,
        attentions: number,
        likes: number,
        latest_notice: string,
        notifications: number,
    },
    users: OrganizationMember[],
    waiting_list: OrganizationJoinRequest[],
    followers: User[],
    likes: User[],
    notifications: Notification[],
    is_official?: boolean,
    type: string,
    unconfirmed?: number,
    undone?: number,
}

export type Task = {
    id: number
    notification_id: number,
    organization_id: number,
    title: string,
    body: string,
    publisher_uid: number,
    publisher: User,
    start_at: number,
    end_at: number,
    created_at: string,
    updated_at: string,
}

export type Notification = {
    id: number,
    title: string,
    body: string,
    sender_uid: number,
    sender?: User,
    sender_role: string,
    organization_id: number,
    organization?: Organization,
    permission: number,
    start_at: number,
    end_at: number,
    priority: number,
    attchments: {
        url: string,
    }[],
    flag: number,
    created_at: string,
    updated_at: string,
    isConfirmed?: boolean,
}

export type UserNotification = {
    id: number,
    user_id: number,
    notification_id: number,
    notification?: Notification,
    organization_id?: number,
    priority: number,
    is_read: number,
    is_confirmed: number,
    start_at: number,
    end_at: number,
    from: number,
    tasks: UserTask[],
    sender_role: string,
}

export type UserTask = {
    id: number,
    user_id: number,
    task_id: number,
    task: Task,
    organization_id: number,
    notification_id: number,
    user_notification_id: number,
    is_done: number,
    start_at: number,
    end_at: number,
    created_at: string,
    updated_at: string,
    organization?: Organization,
}

export type NotificationProfile = {
    notification_id: number,
    views: number,
    clicks: number,
    reads: number,
    sends: number,
    likes: number,
}

export type OrganizationSettings = {
    id: number,
    auto_accept: boolean,
    auto_accept_child: boolean
}

export type OrganizationJoinRequest = {
    id: number,
    organization_id: number,
    user_id: number,
    created_at: string,
    updated_at: string,
    user: User,
    status: number,
    responsible_uid: number,
    responsibles: User
}