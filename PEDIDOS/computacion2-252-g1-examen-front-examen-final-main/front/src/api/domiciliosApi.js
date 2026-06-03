import axiosInstance from './axiosInstance';

export const getDomicilios = () => axiosInstance.get('/domicilios');
export const createDomicilio = (body) => axiosInstance.post('/domicilios', body);
export const updateDomicilio = (id, body) => axiosInstance.put(`/domicilios/${id}`, body);
export const deleteDomicilio = (id) => axiosInstance.delete(`/domicilios/${id}`);
