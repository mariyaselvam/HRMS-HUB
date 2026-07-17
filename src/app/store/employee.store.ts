import { Injectable, signal, computed, inject } from '@angular/core';
import {
    Employee,
    EmployeeApiResponse,
    EmployeeState,
    ApiResponse,
    mapEmployeeResponse
} from '../core/models/employee.model';
import { BaseHttpService } from '../core/services/base-http.service';
import { API_ENDPOINTS } from '../core/constants/app.constants';
import { NotificationService } from '../core/services/notification.service';
import { finalize, map } from 'rxjs';
import { Department } from '../core/models/department.model';

export interface SalarySetupPayload {
    employeeId: string;
    grossSalary: number;
    effectiveFrom: string;
    items: {
        salaryComponentId: string;
        amount: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeStore {
    private http = inject(BaseHttpService);
    private notify = inject(NotificationService);

    // State
    private state = signal<EmployeeState>({
        employees: [],
        loading: false,
        error: null,
        selectedEmployee: null
    });

    private _departments = signal<Department[]>([]);

    // Selectors
    readonly employees = computed(() => this.state().employees);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);
    readonly selectedEmployee = computed(() => this.state().selectedEmployee);
    readonly departments = computed(() => this._departments());

    // Actions
    loadEmployees(locationId?: string | boolean) {
        this.setLoading(true);
        const locId = typeof locationId === 'string' ? locationId : undefined;
        const url = locId 
            ? `${API_ENDPOINTS.EMPLOYEES}?locationId=${locId}` 
            : API_ENDPOINTS.EMPLOYEES;
        this.http.get<ApiResponse<EmployeeApiResponse[]>>(url)
            .pipe(
                map(res => res.data.map(mapEmployeeResponse)),
                finalize(() => this.setLoading(false))
            )
            .subscribe({
                next: (employees) => this.state.update(s => ({ ...s, employees })),
                error: (err) => this.handleError('Failed to load employees', err)
            });
    }

    getEmployee(id: string) {
        this.setLoading(true);
        return this.http.get<any>(`${API_ENDPOINTS.EMPLOYEES}/${id}`)
            .pipe(
                map(res => {
                    // Handle both wrapped { data: ... } and direct responses
                    const raw = res.data || res;
                    return mapEmployeeResponse(raw);
                }),
                finalize(() => this.setLoading(false))
            );
    }

    loadEmployeeById(id: string) {
        this.state.update(s => ({ ...s, selectedEmployee: null }));
        this.getEmployee(id).subscribe({
            next: (emp) => this.state.update(s => ({ ...s, selectedEmployee: emp })),
            error: (err) => this.handleError('Failed to load employee details', err)
        });
    }

    onboardEmployee(payload: any) {
        this.setLoading(true);
        return this.http.post<ApiResponse<EmployeeApiResponse>>(API_ENDPOINTS.EMPLOYEE_ONBOARD, payload)
            .pipe(
                map(res => mapEmployeeResponse(res.data)),
                finalize(() => this.setLoading(false))
            );
    }

    savePersonalDetails(id: string, payload: any) {
        this.setLoading(true);
        return this.http.patch<ApiResponse<any>>((API_ENDPOINTS as any).EMPLOYEE_PERSONAL(id), payload)
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Personal Details Saved', 'Information updated successfully.');
                    return res;
                })
            );
    }

    saveJobDetails(id: string, payload: any) {
        this.setLoading(true);
        return this.http.patch<ApiResponse<any>>((API_ENDPOINTS as any).EMPLOYEE_JOB(id), payload)
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Job Details Saved', 'Information updated successfully.');
                    return res;
                })
            );
    }

    saveBankDetails(id: string, payload: any) {
        this.setLoading(true);
        return this.http.patch<ApiResponse<any>>((API_ENDPOINTS as any).EMPLOYEE_BANK(id), payload)
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Bank Details Saved', 'Information updated successfully.');
                    return res;
                })
            );
    }

    saveStatutoryDetails(id: string, payload: any) {
        this.setLoading(true);
        return this.http.patch<ApiResponse<any>>((API_ENDPOINTS as any).EMPLOYEE_STATUTORY(id), payload)
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Statutory Details Saved', 'Information updated successfully.');
                    return res;
                })
            );
    }

    saveDocuments(id: string, formData: FormData) {
        this.setLoading(true);
        return this.http.post<ApiResponse<any>>((API_ENDPOINTS as any).EMPLOYEE_DOCUMENTS(id), formData)
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Documents Uploaded', 'Files have been saved securely.');
                    return res;
                })
            );
    }

    finalizeOnboarding(id: string) {
        this.setLoading(true);
        return this.http.post<ApiResponse<any>>((API_ENDPOINTS as any).EMPLOYEE_FINALIZE(id), {})
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Onboarding Finalized', 'Employee is now active.');
                    this.loadEmployees(true);
                    return res;
                })
            );
    }

    setupSalary(payload: SalarySetupPayload) {
        this.setLoading(true);
        return this.http.post<ApiResponse<any>>(API_ENDPOINTS.SALARY_SETUP, payload)
            .pipe(
                finalize(() => this.setLoading(false)),
                map(res => {
                    this.notify.success('Salary Setup', 'Salary structure has been configured.');
                    return res;
                })
            );
    }

    loadSalaryStructure(employeeId: string) {
        return this.http.get<ApiResponse<any>>((API_ENDPOINTS as any).SALARY_STRUCTURE(employeeId))
            .pipe(map(res => res.data));
    }

    addEmployee(employee: Partial<Employee>) {
        this.onboardEmployee(employee);
    }

    updateEmployee(id: string, employee: Partial<Employee>) {
        this.setLoading(true);
        this.http.put<ApiResponse<EmployeeApiResponse>>(`${API_ENDPOINTS.EMPLOYEES}/${id}`, employee)
            .pipe(
                map(res => mapEmployeeResponse(res.data)),
                finalize(() => this.setLoading(false))
            )
            .subscribe({
                next: (updated) => {
                    this.state.update(s => ({
                        ...s,
                        employees: s.employees.map(e => e.id === id ? updated : e)
                    }));
                    this.notify.success('Employee Updated', 'Information successfully updated.');
                },
                error: (err) => this.handleError('Update Failed', err)
            });
    }

    deleteEmployee(id: string) {
        this.setLoading(true);
        this.http.delete(`${API_ENDPOINTS.EMPLOYEES}/${id}`)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: () => {
                    this.state.update(s => ({
                        ...s,
                        employees: s.employees.filter(e => e.id !== id)
                    }));
                    this.notify.success('Employee Deleted', 'The employee record has been removed.');
                },
                error: (err) => this.handleError('Deletion Failed', err)
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
