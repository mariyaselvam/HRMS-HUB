import { Injectable, signal, computed } from '@angular/core';

const ACTIVE_BRANCH_KEY = 'hrms_active_branch';
const ACTIVE_CLUSTER_KEY = 'hrms_active_cluster';

@Injectable({
    providedIn: 'root'
})
export class ContextStore {
    private activeBranchIdSignal = signal<string | null>(this.loadActiveBranch());
    private activeClusterIdSignal = signal<string | null>(this.loadActiveCluster());

    readonly activeBranchId = computed(() => this.activeBranchIdSignal());
    readonly activeClusterId = computed(() => this.activeClusterIdSignal());

    setActiveBranch(branchId: string | null) {
        this.activeBranchIdSignal.set(branchId);
        if (branchId) {
            localStorage.setItem(ACTIVE_BRANCH_KEY, branchId);
        } else {
            localStorage.removeItem(ACTIVE_BRANCH_KEY);
        }
    }

    setActiveCluster(clusterId: string | null) {
        this.activeClusterIdSignal.set(clusterId);
        if (clusterId) {
            localStorage.setItem(ACTIVE_CLUSTER_KEY, clusterId);
        } else {
            localStorage.removeItem(ACTIVE_CLUSTER_KEY);
        }
    }

    clearContext() {
        this.setActiveBranch(null);
        this.setActiveCluster(null);
    }

    private loadActiveBranch(): string | null {
        try {
            return localStorage.getItem(ACTIVE_BRANCH_KEY);
        } catch {
            return null;
        }
    }

    private loadActiveCluster(): string | null {
        try {
            return localStorage.getItem(ACTIVE_CLUSTER_KEY);
        } catch {
            return null;
        }
    }
}
