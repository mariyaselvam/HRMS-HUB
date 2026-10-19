import { Injectable, signal, computed, inject } from '@angular/core';
import { DashboardState, DashboardSummary } from '../core/models/dashboard.model';
import { BaseHttpService } from '../core/services/base-http.service';
import { API_ENDPOINTS } from '../core/constants/app.constants';
import { ApiResponse } from '../core/models/employee.model';
import { NotificationService } from '../core/services/notification.service';
import { finalize } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class DashboardStore {
    private http = inject(BaseHttpService);
    private notify = inject(NotificationService);

    // State
    private state = signal<DashboardState>({
        summary: null,
        loading: false,
        error: null
    });

    // Selectors
    readonly summary = computed(() => this.state().summary);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);

    // Actions
    loadSummary(locationId?: string) {
        this.setLoading(true);
        const url = locationId 
            ? `${API_ENDPOINTS.DASHBOARD}/summary?locationId=${locationId}` 
            : `${API_ENDPOINTS.DASHBOARD}/summary`;
        this.http.get<ApiResponse<DashboardSummary>>(url)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: (res) => this.state.update(s => ({ ...s, summary: res.data })),
                error: (err) => this.handleError('Failed to load dashboard summary', err)
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
