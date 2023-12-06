import { getAssetsFile } from '../utils'
import { apiUserIntro, apiUserProfile } from '../interface/user'
import { defineStore } from 'pinia'
import { Organization } from '../interface/typ'
import { notificationDatabase } from './notification'

export const useUserStore = defineStore('user', {
    state : () => ({
        _Id : 0,
        _Username : '游客',
        _Avatar: getAssetsFile('long.gif'),
        _Online : false,
        _Role: '未登录',
        _Sign: '这个人很懒，什么都没有留下',
        _Organizations : [] as Organization[],
        _FollowingOrganizations : [] as Organization[],
        _ManagingOrganizations : [] as Organization[],
        _Intro: false,
        _OrganizationUnconfirmed: [] as {
            id: number,
            count: number
        }[],
        _OrganizationUnDone: [] as {
            id: number,
            count: number
        }[],
        _Welcome: window.localStorage.getItem('welcome') === 'true'
    }),
    getters : {
        Welcome(state) {
            return state._Welcome
        },
        UserId(state) {
            return state._Id
        },
        UserName(state) {
            return state._Username
        },
        UserAvatar(state) {
            return state._Avatar
        },
        UserOnline(state) {
            return state._Online
        },
        UserRole(state) {
            return state._Role
        },
        UserSign(state) {
            return state._Sign
        },
        IsAdmin(state) {
            return state._Role === 'admin'
        },
        UserOrganizations(state) {
            for (const organization of state._Organizations || []) {
                // fill unconfirmed count
                const index = state._OrganizationUnconfirmed.findIndex(
                    (item) => item.id === organization.id
                )
                if (index !== -1) {
                    organization.unconfirmed = state._OrganizationUnconfirmed[index].count
                }
                // fill undone count
                const index2 = state._OrganizationUnDone.findIndex(
                    (item) => item.id === organization.id
                )
                if (index2 !== -1) {
                    organization.undone = state._OrganizationUnDone[index2].count
                }
            }
            return state._Organizations
        },
        UserFollowingOrganizations(state) {
            // fill unconfirmed count
            for (const organization of state._FollowingOrganizations || []) {
                const index = state._OrganizationUnconfirmed.findIndex(
                    (item) => item.id === organization.id
                )
                if (index !== -1) {
                    organization.unconfirmed = state._OrganizationUnconfirmed[index].count
                }
                // fill undone count
                const index2 = state._OrganizationUnDone.findIndex(
                    (item) => item.id === organization.id
                )
                if (index2 !== -1) {
                    organization.undone = state._OrganizationUnDone[index2].count
                }
            }
            return state._FollowingOrganizations
        },
        UserManagingOrganizations(state) {
            // fill unconfirmed count
            for (const organization of state._ManagingOrganizations || []) {
                const index = state._OrganizationUnconfirmed.findIndex(
                    (item) => item.id === organization.id
                )
                if (index !== -1) {
                    organization.unconfirmed = state._OrganizationUnconfirmed[index].count
                }
                // fill undone count
                const index2 = state._OrganizationUnDone.findIndex(
                    (item) => item.id === organization.id
                )
                if (index2 !== -1) {
                    organization.undone = state._OrganizationUnDone[index2].count
                }
            }
            return state._ManagingOrganizations
        },
        UserIntro(state) {
            return state._Intro
        }
    },
    actions : {
        refresh() {
            this.setUserId(this._Id)
        },
        setWelcome(welcome: boolean) {
            this._Welcome = welcome
            window.localStorage.setItem('welcome', welcome ? 'true' : 'false')
        },
        setUserId(id : number) {
            this._Id = id
            setTimeout(async () => {
                const response = await apiUserProfile()
                if (!response.isSuccess()) {
                    return
                }
                this.setUserName(response.data?.username as string)
                this.setUserAvatar(response.data?.profile.avatar as string)
                this.setUserOrganizations(response.data?.organizations as Organization[])
                this.setUserFollowingOrganizations(response.data?.followings as Organization[])
                this.setUserManagingOrganizations(response.data?.manages as Organization[])
                this.setUserIntro(response.data?.profile.intro as boolean)

                // update database
                for (const organization of response.data?.organizations as Organization[]) {
                    // check if organization exists
                    const organization_exists = await notificationDatabase.organizations
                        .get(organization.id)
                    if (organization_exists) {
                        await notificationDatabase.organizations
                            .update(organization.id, organization)
                    } else {
                        await notificationDatabase.organizations
                            .put(organization)
                    }
                }
                for (const organization of response.data?.followings as Organization[]) {
                    // check if organization exists
                    const organization_exists = await notificationDatabase.organizations
                        .get(organization.id)
                    if (organization_exists) {
                        await notificationDatabase.organizations
                            .update(organization.id, organization)
                    } else {
                        await notificationDatabase.organizations
                            .put(organization)
                    }
                }
            })
        },
        intro() {
            this.setUserIntro(true)
            setTimeout(async () => {
                await apiUserIntro()
                this.refresh()
            })
        },
        setUserName(name : string) {
            this._Username = name
        },
        setUserAvatar(avatar : string) {
            this._Avatar = avatar
        },
        setUserOnline(online : boolean) {
            this._Online = online
        },
        setUserRole(role : string) {
            this._Role = role
        },
        setUserSign(sign : string) {
            this._Sign = sign
        },
        setUserOrganizations(organizations : Organization[]) {
            this._Organizations = organizations
        },
        setUserFollowingOrganizations(organizations : Organization[]) {
            this._FollowingOrganizations = organizations
        },
        setUserOrganizationUnconfirmed(id : number, count: number) {
            const index = this._OrganizationUnconfirmed.findIndex(
                (item) => item.id === id
            )
            if (index !== -1) {
                this._OrganizationUnconfirmed[index].count = count
            } else {
                this._OrganizationUnconfirmed.push({
                    id,
                    count
                })
            }
        },
        setUserOrganizationUnDone(id : number, count: number) {
            const index = this._OrganizationUnDone.findIndex(
                (item) => item.id === id
            )
            if (index !== -1) {
                this._OrganizationUnDone[index].count = count
            } else {
                this._OrganizationUnDone.push({
                    id,
                    count
                })
            }
        },
        setUserManagingOrganizations(organizations : Organization[]) {
            this._ManagingOrganizations = organizations
        },
        setUserIntro(intro : boolean) {
            this._Intro = intro
        }
    }
})