import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SalaryComponentConfig {
  id?: string;
  name: string;
  code: string;
  type: 'earning' | 'deduction';
  calcType: 'fixed' | 'pct_ctc' | 'pct_gross' | 'pct_basic' | 'formula' | 'manual' | 'remaining';
  calcValue: number;
  formula?: string | null;
  isTaxable: boolean;
  pfApplicable: boolean;
  esiApplicable: boolean;
  isActive?: boolean;
}

export interface SalaryTemplateItem {
  id?: string;
  salaryTemplateId?: string;
  salaryComponentId: string;
  component: SalaryComponentConfig;
  calcType?: string;
  calcValue?: number;
  calculationOrder: number;
}

export interface SalaryTemplateConfig {
  id?: string;
  name: string;
  description?: string;
  items?: SalaryTemplateItem[];
}

export interface PreviewBreakdownItem {
  code: string;
  name: string;
  type: 'earning' | 'deduction';
  value: number;
}

export interface CalculationPreviewResult {
  breakdown: PreviewBreakdownItem[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

@Injectable({
  providedIn: 'root',
})
export class SalaryConfigService {
  private http = inject(BaseHttpService);

  // Components APIs
  getComponents(): Observable<SalaryComponentConfig[]> {
    return this.http
      .get<{ success: boolean; data: SalaryComponentConfig[] }>('/payroll/config/components')
      .pipe(map((res) => res.data));
  }

  createComponent(data: SalaryComponentConfig): Observable<SalaryComponentConfig> {
    return this.http
      .post<{ success: boolean; data: SalaryComponentConfig }>('/payroll/config/components', data)
      .pipe(map((res) => res.data));
  }

  updateComponent(id: string, data: SalaryComponentConfig): Observable<SalaryComponentConfig> {
    return this.http
      .put<{
        success: boolean;
        data: SalaryComponentConfig;
      }>(`/payroll/config/components/${id}`, data)
      .pipe(map((res) => res.data));
  }

  deleteComponent(id: string): Observable<any> {
    return this.http.delete<any>(`/payroll/config/components/${id}`);
  }

  // Templates APIs
  getTemplates(): Observable<SalaryTemplateConfig[]> {
    return this.http
      .get<{ success: boolean; data: SalaryTemplateConfig[] }>('/payroll/config/templates')
      .pipe(map((res) => res.data));
  }

  createTemplate(data: any): Observable<SalaryTemplateConfig> {
    return this.http
      .post<{ success: boolean; data: SalaryTemplateConfig }>('/payroll/config/templates', data)
      .pipe(map((res) => res.data));
  }

  calculatePreview(templateId: string, monthlyCTC: number): Observable<CalculationPreviewResult> {
    return this.http
      .post<{ success: boolean; data: CalculationPreviewResult }>(
        '/payroll/config/calculate-preview',
        {
          templateId,
          monthlyCTC,
        },
      )
      .pipe(map((res) => res.data));
  }
}
