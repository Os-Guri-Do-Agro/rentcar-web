import api from './api';

export async function handleRequest<T>(request: Promise<any>): Promise<T | null> {
  try {
    const response = await request;
    return response.data as T;
  } catch (error: any) {
    console.error('Erro na requisição:', error.response?.data || error.message);
    return null; 
  }
}