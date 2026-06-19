import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class BaseHttpService {
    private http = inject(HttpClient);
    private baseUrl = APP_CONFIG.API_BASE_URL;

    get<T>(endpoint: string, params?: any): Observable<T> {
        const httpParams = this.getHttpParams(params);
        return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
    }

    post<T>(endpoint: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
    }

    put<T>(endpoint: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
    }

    patch<T>(endpoint: string, body: any): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
    }

    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
    }

    download(endpoint: string, filename: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}${endpoint}`, {
            responseType: 'blob',
            headers: new HttpHeaders({ 'Accept': 'application/pdf' })
        });
    }

    private getHttpParams(params: any): HttpParams {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }
        return httpParams;
    }
}
