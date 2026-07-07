import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CompensationCycle {
    id: string;
    companyId: string;
    name: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'applied';
    effectiveFrom: string;
    createdAt: string;
    updatedAt: string;
    revisions?: SalaryRevision[];
}

export interface SalaryRevision {
    id: string;
    compensationCycleId: string;
    employeeId: string;
    currentGross: number;
    proposedGross: number;
    basicSalary: number;
    hra: number;
    transportAllowance: number;
    otherAllowances: number;
    status: 'draft' | 'approved' | 'rejected';
    employee: {
        employeeCode: string;
        department: { name: string };
        personalDetails: { firstName: string; lastName: string };
    };
}

@Injectable({
    providedIn: 'root'
})
export class CompensationService {
    private http = inject(BaseHttpService);

    getCycles(): Observable<CompensationCycle[]> {
        return this.http.get<{ success: boolean; data: CompensationCycle[] }>('/payroll/compensation')
            .pipe(map(res => res.data));
    }

    createCycle(name: string, effectiveFrom: string): Observable<CompensationCycle> {
        return this.http.post<{ success: boolean; data: CompensationCycle }>('/payroll/compensation', { name, effectiveFrom })
            .pipe(map(res => res.data));
    }

    getCycleRevisions(cycleId: string): Observable<CompensationCycle> {
        return this.http.get<{ success: boolean; data: CompensationCycle }>(`/payroll/compensation/${cycleId}/revisions`)
            .pipe(map(res => res.data));
    }

    bulkUpdateRevisions(
        cycleId: string,
        payload: {
            filters: { departmentId?: string; employeeIds?: string[] };
            incrementType: 'percentage' | 'fixed';
            value: number;
        }
    ): Observable<{ computedCount: number }> {
        return this.http.post<{ success: boolean; data: { computedCount: number } }>(
            `/payroll/compensation/${cycleId}/bulk-update`,
            payload
        ).pipe(map(res => res.data));
    }

    applyCycle(cycleId: string): Observable<{ success: boolean; appliedCount: number }> {
        return this.http.post<{ success: boolean; data: { success: boolean; appliedCount: number } }>(
            `/payroll/compensation/${cycleId}/apply`,
            {}
        ).pipe(map(res => res.data));
    }
}
