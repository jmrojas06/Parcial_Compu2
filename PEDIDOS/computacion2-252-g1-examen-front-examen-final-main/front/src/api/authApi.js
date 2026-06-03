import axiosInstance from './axiosInstance';

export const login = (username, password) =>
  axiosInstance.post('/auth/login', { username, password });
