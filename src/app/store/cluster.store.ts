import { Injectable, signal, computed, inject } from '@angular/core';
import { Cluster } from '../core/models/location.model';
import { BaseHttpService } from '../core/services/base-http.service';
import { API_ENDPOINTS } from '../core/constants/app.constants';
import { ApiResponse } from '../core/models/employee.model';
import { NotificationService } from '../core/services/notification.service';
import { finalize } from 'rxjs';

export interface ClusterState {
    clusters: Cluster[];
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ClusterStore {
    private http = inject(BaseHttpService);
    private notify = inject(NotificationService);

    // State
    private state = signal<ClusterState>({
        clusters: [],
        loading: false,
        error: null
    });

    // Selectors
    readonly clusters = computed(() => this.state().clusters);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);

    loadClusters(force: boolean = false) {
        if (!force && this.state().clusters.length > 0) {
            return;
        }
        this.setLoading(true);
        this.http.get<ApiResponse<Cluster[]>>(API_ENDPOINTS.CLUSTERS)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: (res) => this.state.update(s => ({ ...s, clusters: res.data })),
                error: (err) => this.handleError('Failed to load clusters', err)
            });
    }

    addCluster(data: { name: string; code?: string; state?: string }) {
        this.setLoading(true);
        this.http.post<ApiResponse<Cluster>>(API_ENDPOINTS.CLUSTERS, data)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: (res) => {
                    this.state.update(s => ({ ...s, clusters: [...s.clusters, res.data] }));
                    this.notify.success('Cluster Added', `Regional cluster "${res.data.name}" created`);
                },
                error: (err) => this.handleError('Failed to create cluster', err)
            });
    }

    updateCluster(id: string, data: Partial<Cluster>) {
        this.setLoading(true);
        this.http.patch<ApiResponse<Cluster>>(`${API_ENDPOINTS.CLUSTERS}/${id}`, data)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: (res) => {
                    this.state.update(s => ({
                        ...s,
                        clusters: s.clusters.map(c => c.id === id ? res.data : c)
                    }));
                    this.notify.success('Cluster Updated', `Cluster "${res.data.name}" updated`);
                },
                error: (err) => this.handleError('Failed to update cluster', err)
            });
    }

    deleteCluster(id: string) {
        this.setLoading(true);
        this.http.delete<ApiResponse<any>>(`${API_ENDPOINTS.CLUSTERS}/${id}`)
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: () => {
                    this.state.update(s => ({
                        ...s,
                        clusters: s.clusters.filter(c => c.id !== id)
                    }));
                    this.notify.success('Cluster Deleted', 'Cluster deleted and branches unlinked');
                },
                error: (err) => this.handleError('Failed to delete cluster', err)
            });
    }

    assignBranch(branchId: string, clusterId: string | null) {
        this.setLoading(true);
        this.http.patch<ApiResponse<any>>(API_ENDPOINTS.BRANCH_ASSIGN_CLUSTER(branchId), { clusterId })
            .pipe(finalize(() => this.setLoading(false)))
            .subscribe({
                next: () => {
                    this.notify.success('Branch Assigned', 'Branch cluster assignment updated');
                    this.loadClusters(true);
                },
                error: (err) => this.handleError('Assignment Failed', err)
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
