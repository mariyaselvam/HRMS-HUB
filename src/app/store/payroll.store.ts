import { Injectable, signal, computed, inject } from '@angular/core';
import {
    PayrollCycle,
    PayrollRecord,
    PayrollState,
    SalarySetupInput,
    GeneratePayrollInput
} from '../core/models/payroll.model';
import { BaseHttpService } from '../core/services/base-http.service';
import { API_ENDPOINTS } from '../core/constants/app.constants';
import { ApiResponse } from '../core/models/employee.model';
import { NotificationService } from '../core/services/notification.service';
import { finalize } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PayrollStore {
    private http = inject(BaseHttpService);
    private notify = inject(NotificationService);

    // State
    private state = signal<PayrollState>({
        cycles: [],
        records: [],
        loading: false,
        error: null
    });

    // Selectors
    readonly cycles = computed(() => this.state().cycles);
    readonly records = computed(() => this.state().records);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);

    // Actions
    setupSalary(data: SalarySetupInput) {
        this.setLoading(true);
        this.http.post<ApiResponse<any>>(`${API_ENDPOINTS.PAYROLL}/salary-setup`, data)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: () => {
                    this.notify.success('Salary Configured', 'Salary structure has been updated successfully.');
                },
                error: (err) => this.handleError('Salary Setup Failed', err)
            });
    }

    generatePayroll(data: GeneratePayrollInput) {
        this.setLoading(true);
        this.http.post<ApiResponse<any>>(`${API_ENDPOINTS.PAYROLL}/generate`, data)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: (res) => {
                    this.notify.success('Payroll Generated', `Successfully generated payroll for ${data.month}`);
                    this.loadRecords(data.month);
                },
                error: (err) => this.handleError('Generation Failed', err)
            });
    }

    loadRecords(month: string) {
        this.setLoading(true);
        this.http.get<ApiResponse<PayrollRecord[]>>(`${API_ENDPOINTS.PAYROLL}/records`, { month })
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: (res) => this.state.update(s => ({ ...s, records: res.data })),
                error: (err) => this.handleError('Failed to load records', err)
            });
    }

    finalizePayroll(id: string, month: string) {
        this.setLoading(true);
        this.http.patch<ApiResponse<any>>(`${API_ENDPOINTS.PAYROLL}/cycles/${id}/finalize`, {})
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: () => {
                    this.notify.success('Payroll Finalized', 'The payroll cycle has been locked.');
                    this.loadRecords(month);
                },
                error: (err) => this.handleError('Finalization Failed', err)
            });
    }

    updateRecord(id: string, data: any, month: string) {
        this.setLoading(true);
        this.http.patch<ApiResponse<any>>(`${API_ENDPOINTS.PAYROLL}/records/${id}`, data)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: () => {
                    this.notify.success('Record Adjusted', 'The payroll record adjustments have been saved.');
                    this.loadRecords(month);
                },
                error: (err) => this.handleError('Adjustment Failed', err)
            });
    }

    private setLoading(loading: boolean) {
        this.state.update(s => ({ ...s, loading }));
    }

    private handleError(summary: string, error: any) {
        const errorMsg = error.error?.message || error.message || 'An unexpected error occurred';
        this.state.update(s => ({ ...s, error: errorMsg }));
        this.notify.error(summary, errorMsg);
    }
}
