import axios from 'axios';

interface bodyPayload {
    [key: string]: string | number | unknown;
}

interface APIServicePayload {
    method: string;
    endpoint: string;
    body?: bodyPayload;
    param?: string;
}

interface AxiosConfiguration {
    url: string;
    method: string;
    data?: bodyPayload;
    param?: string;
}

export interface ProcessEnv {
    [key: string]: string | undefined
  }
  


const baseURL = "http://localhost:5000/api/v1/car-parking";
export const apiService = async (payload: APIServicePayload): Promise<object>=> {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    }


    console.log('payload', payload)
    let path = baseURL + payload.endpoint;
    const request = {
        url: path,
        method: payload.method,
        headers,
    } as AxiosConfiguration;

    if (request.param) {
        path = `${path}/?${payload.param}`
        request.url = baseURL;
    } else {
        request.data = {
            ...payload.body
        };
    }

    const response = await axios(request);
    return response.data;
}