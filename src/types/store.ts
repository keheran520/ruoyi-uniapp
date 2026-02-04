
export interface UserState {
    info: string,
    token: string,
    name: string,
    avatar: string,
    roles: Array<string>
    permissions: Array<string>
    userProfile: any
}

export interface UserForm {
	tenantId: string
    username: string
    password: string
    code: string
    uuid: string
}

export interface WebsiteConfig {
    name: string
    logo: string
    copyright: string
    icp: string
}

export interface WebsiteState {
    websiteConfig: WebsiteConfig
}


