import { request } from './axios'
export class Logins {       // 登录模块
    static async register(params) {  
        return request('/api/users/register',params, 'post')
    }
    static async login(params) {  
        return request('/api/users/login',params, 'post')
    }
}

export class landRelevant {     // 模块二
    static async landList(params) {
        return request('',params, 'get')
    }
}