import { RequestMethods, apiBase } from "./base"
import { Organization, OrganizationJoinRequest, OrganizationMember, OrganizationSettings, User } from "./typ"

export const apiOrganizationCreate = (
    name: string, description: string, parent_id: number, lng: number, lat: number, typ: string
) => apiBase<{
    success: boolean,
}>('/v1/org/create', RequestMethods.POST, {
    name, description, parent_id, lng, lat, typ
})

export const apiOrganizationSearchNearby = (
    lng: number, lat: number
) => apiBase<{
    organizations: Organization[]
}>('/v1/org/search/nearby', RequestMethods.GET, {
    lng, lat
})

export const apiOrganizationSearchByTitle = (
    title: string
) => apiBase<{
    organizations: Organization[]
}>('/v1/org/search/title', RequestMethods.GET, {
    title
})

export const apiOrganizationSearchByBulk = (
    title: string, lng: number, lat: number, typ: string, is_official: boolean
) => apiBase<{
    organizations: Organization[]
}>('/v1/org/search/bulk', RequestMethods.GET, {
    title, lng, lat, typ, is_official
})

export const apiOrganizationProfile = (
    id: number
) => apiBase<{
    organization: Organization
}>('/v1/org/profile', RequestMethods.GET, {
    id
})

export const apiOrganizationInfo = (
    id: number
) => apiBase<{
    organization: Organization
}>('/v1/org/info', RequestMethods.GET, {
    id
})

export const apiOrganizationApplyOfficial = (
    oid: number, concat: string, content: string
) => apiBase<{
    success: boolean,
}>('/v1/org/official/apply', RequestMethods.POST, {
    oid, concat, content
})

export const apiOrganizationListJoinRequest = (
    oid: number, status: number, page: number
) => apiBase<{
    wait_list: OrganizationJoinRequest[],
    total: number,
}>('/v1/org/join_request/list', RequestMethods.GET, {
    oid, status, page
})

export const apiOrganizationJoinRequest = (
    oid: number, name: string
) => apiBase<{
    success: boolean,
}>('/v1/org/join_request/add', RequestMethods.POST, {
    oid, name
})

export const apiOrganizationJoinRequestAccept = (
    rid: number
) => apiBase<{
    success: boolean,
}>('/v1/org/join_request/accept', RequestMethods.POST, {
    rid
})

export const apiOrganizationJoinRequestReject = (
    rid: number
) => apiBase<{
    success: boolean,
}>('/v1/org/join_request/reject', RequestMethods.POST, {
    rid
})

export const apiOrganizationListUserManage = () => apiBase<{
    organizations: Organization[]
}>('/v1/org/user/list/manage', RequestMethods.GET, {})

export const apiOrganizationGetSettings = (oid : number) => apiBase<{
    settings: OrganizationSettings
}>('/v1/org/settings/get', RequestMethods.GET, {
    oid
})

export const apiOrganizationSetSettings = (
    oid: number, auto_accept: boolean, auto_accept_child: boolean
) => apiBase<{
    success: boolean,
}>('/v1/org/settings/update', RequestMethods.POST, {
    oid, auto_accept, auto_accept_child
})

export const apiOrganizationUpdate = (
    oid: number, name: string, description: string, avatar: string, typ: string
) => apiBase<{
    success: boolean,
}>('/v1/org/update', RequestMethods.POST, {
    oid, name, description, avatar, typ
})

export const apiOrganizationListArchtecture = (
    oid: number, page: number
) => apiBase<{
    organization: Organization,
    members: OrganizationMember[],
    children: Organization[],
}>('/v1/org/architecture/list', RequestMethods.GET, {
    oid, page
})

export const apiOrganizationListMembers = (
    oid: number, page: number, sub_oid: number, name: string
) => apiBase<{
    members: OrganizationMember[],
    total: number,
}>('/v1/org/members/list', RequestMethods.GET, {
    oid, page, sub_oid, name
})

export const apiOrganizationUpdateMember = (
    oid: number, uid: number, role: string, name: string, is_manager: boolean
) => apiBase<{
    success: boolean,
}>('/v1/org/member/update', RequestMethods.POST, {
    oid, uid, role, name, is_manager
})

export const apiOrganizationLike = (
    oid: number
) => apiBase<{
    success: boolean,
}>('/v1/org/like', RequestMethods.POST, {
    oid
})

export const apiOrganizationDislike = (
    oid: number
) => apiBase<{
    success: boolean,
}>('/v1/org/dislike', RequestMethods.POST, {
    oid
})

export const apiOrganizationFollow = (
    oid: number
) => apiBase<{
    success: boolean,
}>('/v1/org/follow', RequestMethods.POST, {
    oid
})

export const apiOrganizationUnfollow = (
    oid: number
) => apiBase<{
    success: boolean,
}>('/v1/org/unfollow', RequestMethods.POST, {
    oid
})

export const apiOrganizationInvite = (
    oid: number
) => apiBase<{
    invite_code: string,
}>('/v1/org/invite', RequestMethods.GET, {
    oid
})

export const apiOrganizationJoinInvite = (
    code: string, oid: number, name: string
) => apiBase<{
    success: boolean,
}>('/v1/org/invite/join', RequestMethods.POST, {
    code, oid, name
})