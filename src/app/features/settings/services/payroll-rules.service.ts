import { Injectable, inject } from '@angular/core';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { API_ENDPOINTS } from '../../../core/constants/app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayrollRulesService {
  private http = inject(BaseHttpService);

  getRule(workLocationId?: string, effective: boolean = false): Observable<any> {
    const params: string[] = [];
    if (workLocationId) params.push(`workLocationId=${encodeURIComponent(workLocationId)}`);
    if (effective) params.push(`effective=true`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get(`${API_ENDPOINTS.PAYROLL}/rules${query}`);
  }

  getAllRules(): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.PAYROLL_RULES_ALL}`);
  }

  upsertRule(payload: any, workLocationId?: string): Observable<any> {
    const query = workLocationId ? `?workLocationId=${encodeURIComponent(workLocationId)}` : '';
    return this.http.post(`${API_ENDPOINTS.PAYROLL}/rules${query}`, {
      ...payload,
      workLocationId: workLocationId || payload.workLocationId || null
    });
  }

  getRuns(): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.PAYROLL}/runs`);
  }

  previewRun(period: string): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.PAYROLL}/runs/preview?period=${period}`);
  }

  getReadiness(period: string, clusterId?: string, branchIds?: string[]): Observable<any> {
    const params: string[] = [`period=${encodeURIComponent(period)}`];
    if (clusterId) params.push(`clusterId=${encodeURIComponent(clusterId)}`);
    if (branchIds && branchIds.length > 0) params.push(`branchIds=${encodeURIComponent(branchIds.join(','))}`);
    return this.http.get(`${API_ENDPOINTS.PAYROLL_READINESS}?${params.join('&')}`);
  }

  executeRun(payload: any): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.PAYROLL}/runs/execute`, payload);
  }

  executeBatchRun(payload: {
    period: string;
    runType?: string;
    scope?: 'ALL' | 'CLUSTER' | 'BRANCHES';
    clusterId?: string;
    branchIds?: string[];
    skipWarnings?: boolean;
  }): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.PAYROLL_RUNS_BATCH}`, payload);
  }
}
