import request from '@/utils/request'

export function getCode(data) {
  return request({
    url: '/rest/admin/getCaptcha',
    method: 'get',
    params: data
  })
}

export function login(data) {
  return request({
    url: '/rest/admin/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
