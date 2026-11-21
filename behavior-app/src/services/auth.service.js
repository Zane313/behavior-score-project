import { api } from '@/boot/axios'

export const login = (username, password) => {
  return api.get(`/users?username=${username}&password=${password}`)
}

export const getProfile = (id) => {
  return api.get(`/users/${id}`)
}
