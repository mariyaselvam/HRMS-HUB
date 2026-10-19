import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CommonButtonComponent } from '../../../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../../../shared/components/common-input/common-input.component';
import { PayrollRulesService } from '../../services/payroll-rules.service';
import { ClusterStore } from '../../../../store/cluster.store';
import { LocationStore } from '../../../../store/location.store';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-manual-payroll-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, CommonButtonComponent, CommonInputComponent],
    template: `
        <p-dialog 
            header="Eagle-Eye Centralized Batch Payroll" 
            [(visible)]="visible" 
            [modal]="true" 
            [style]="{width: '750px'}" 
            [draggable]="false" 
            [resizable]="false"
            (onHide)="close()">
            
            <div class="py-2 space-y-5">
                <div class="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-start gap-3">
                    <i class="pi pi-bolt text-indigo-600 dark:text-indigo-400 text-lg mt-0.5"></i>
                    <p class="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                        Execute multi-branch batch payroll in one click. Our pre-flight engine audits all branches, checks salary configurations, flags unapproved leaves, and calculates total payouts before execution.
                    </p>
                </div>
                
                <!-- Controls Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <app-common-input 
                        label="Payroll Period (YYYY-MM)" 
                        [(ngModel)]="period" 
                        placeholder="e.g. 2026-10" 
                        icon="pi pi-calendar">
                    </app-common-input>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Execution Scope</label>
                        <select [(ngModel)]="scope" (ngModelChange)="onScopeChange()"
                            class="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                            <option value="ALL">🏢 All Company Branches (Universal Run)</option>
                            <option value="CLUSTER">🌐 Regional Cluster Scope</option>
                            <option value="BRANCHES">📍 Specific Branch Selection</option>
                        </select>
                    </div>

                    <!-- Cluster Picker (Conditional) -->
                    <div *ngIf="scope === 'CLUSTER'">
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Cluster</label>
                        <select [(ngModel)]="selectedClusterId" (ngModelChange)="readinessData = null"
                            class="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                            <option value="">Select a Regional Cluster...</option>
                            <option *ngFor="let cl of clusterStore.clusters()" [value]="cl.id">
                                {{ cl.name }} {{ cl.state ? '(' + cl.state + ')' : '' }}
                            </option>
                        </select>
                    </div>

                    <!-- Branch Picker (Conditional) -->
                    <div *ngIf="scope === 'BRANCHES'">
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Branch</label>
                        <select [(ngModel)]="selectedBranchId" (ngModelChange)="readinessData = null"
                            class="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                            <option value="">Select a Branch...</option>
                            <option *ngFor="let loc of locationStore.locations()" [value]="loc.id">
                                {{ loc.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Pre-Flight Audit Dashboard -->
                <div *ngIf="readinessData" class="space-y-4">
                    <!-- Metrics Summary -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span class="text-xs text-slate-500 block">Total Branches</span>
                            <span class="text-base font-bold text-slate-800 dark:text-white">{{ readinessData.totalBranches }}</span>
                        </div>
                        <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <span class="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">Ready Branches</span>
                            <span class="text-base font-bold text-emerald-700 dark:text-emerald-300">{{ readinessData.readyBranches }}</span>
                        </div>
                        <div class="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                            <span class="text-xs text-rose-600 dark:text-rose-400 block font-medium">Blocked</span>
                            <span class="text-base font-bold text-rose-700 dark:text-rose-300">{{ readinessData.blockedBranches }}</span>
                        </div>
                        <div class="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                            <span class="text-xs text-indigo-600 dark:text-indigo-400 block font-medium">Eligible Staff</span>
                            <span class="text-base font-bold text-indigo-700 dark:text-indigo-300">{{ readinessData.totalEligibleEmployees }}</span>
                        </div>
                    </div>

                    <!-- Branch Checklist -->
                    <div class="max-h-56 overflow-y-auto space-y-2 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-white dark:bg-slate-900">
                        <div *ngFor="let branch of readinessData.branches" 
                            class="p-2.5 rounded-lg border flex items-start justify-between gap-3 text-xs"
                            [ngClass]="branch.isReady ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'">
                            <div>
                                <div class="flex items-center gap-2">
                                    <i class="pi text-xs" [ngClass]="branch.isReady ? 'pi-check-circle text-emerald-600' : 'pi-exclamation-triangle text-rose-600'"></i>
                                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ branch.branchName }}</span>
                                    <span *ngIf="branch.cluster" class="text-slate-400 font-medium">({{ branch.cluster.name }})</span>
                                    <span *ngIf="branch.rule?.isInherited" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Master Rule</span>
                                    <span *ngIf="branch.rule && !branch.rule?.isInherited" class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold">Override</span>
                                </div>
                                
                                <!-- Blockers / Warnings -->
                                <div *ngIf="branch.blockers?.length > 0" class="mt-1.5 space-y-0.5 text-rose-600 dark:text-rose-400 font-medium pl-4">
                                    <div *ngFor="let b of branch.blockers">• {{ b }}</div>
                                </div>
                                <div *ngIf="branch.warnings?.length > 0" class="mt-1 space-y-0.5 text-amber-600 dark:text-amber-400 pl-4">
                                    <div *ngFor="let w of branch.warnings">• {{ w }}</div>
                                </div>
                            </div>
                            
                            <div class="text-right whitespace-nowrap">
                                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ branch.employeeCount }} staff</span>
                                <span class="block text-slate-500 font-mono text-[11px]">Est. ₹{{ branch.estimatedGross | number:'1.2-2' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Execution Results View -->
                <div *ngIf="executionResult" class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                        <i class="pi pi-check-circle text-emerald-600"></i>
                        <span>Centralized Payroll Batch Run Completed!</span>
                    </div>
                    <p class="text-xs text-emerald-700 dark:text-emerald-300">
                        Processed <b>{{ executionResult.totalEmployees }}</b> employees across branches with a total net payout of <b>₹{{ executionResult.totalAmount | number:'1.2-2' }}</b>.
                    </p>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <app-button label="Close" variant="ghost" (onClick)="close()"></app-button>
                <app-button 
                    *ngIf="!readinessData && !executionResult" 
                    label="Run Pre-Flight Audit" 
                    variant="secondary" 
                    icon="pi pi-search" 
                    (onClick)="auditReadiness()" 
                    [loading]="loading">
                </app-button>
                <app-button 
                    *ngIf="readinessData && !executionResult" 
                    [label]="readinessData.blockedBranches > 0 ? 'Force Batch Execution' : 'Execute Batch Payroll'" 
                    [variant]="readinessData.blockedBranches > 0 ? 'danger' : 'primary'" 
                    icon="pi pi-play" 
                    (onClick)="executeBatch()" 
                    [loading]="loading">
                </app-button>
            </ng-template>
        </p-dialog>
    `
})
export class ManualPayrollModalComponent implements OnInit {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onSuccess = new EventEmitter<void>();

    private service = inject(PayrollRulesService);
    protected clusterStore = inject(ClusterStore);
    protected locationStore = inject(LocationStore);
    private notify = inject(NotificationService);

    period = '';
    scope: 'ALL' | 'CLUSTER' | 'BRANCHES' = 'ALL';
    selectedClusterId = '';
    selectedBranchId = '';
    readinessData: any = null;
    executionResult: any = null;
    loading = false;

    ngOnInit() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        this.period = `${year}-${month}`;
        this.clusterStore.loadClusters();
        this.locationStore.loadLocations();
    }

    onScopeChange() {
        this.readinessData = null;
        this.executionResult = null;
    }

    auditReadiness() {
        if (!this.period) {
            this.notify.error('Validation Error', 'Please enter a valid period (YYYY-MM)');
            return;
        }

        const clusterId = this.scope === 'CLUSTER' ? this.selectedClusterId || undefined : undefined;
        const branchIds = this.scope === 'BRANCHES' && this.selectedBranchId ? [this.selectedBranchId] : undefined;

        this.loading = true;
        this.service.getReadiness(this.period, clusterId, branchIds).subscribe({
            next: (res: any) => {
                this.readinessData = res;
                this.loading = false;
            },
            error: (err: any) => {
                this.notify.error('Audit Failed', err.message);
                this.loading = false;
            }
        });
    }

    executeBatch() {
        this.loading = true;
        const clusterId = this.scope === 'CLUSTER' ? this.selectedClusterId || undefined : undefined;
        const branchIds = this.scope === 'BRANCHES' && this.selectedBranchId ? [this.selectedBranchId] : undefined;
        const skipWarnings = this.readinessData?.blockedBranches > 0;

        this.service.executeBatchRun({
            period: this.period,
            runType: 'Manual',
            scope: this.scope,
            clusterId,
            branchIds,
            skipWarnings
        }).subscribe({
            next: (res: any) => {
                this.executionResult = res;
                this.loading = false;
                this.notify.success('Batch Success', 'Centralized payroll processed successfully');
                this.onSuccess.emit();
            },
            error: (err: any) => {
                this.notify.error('Execution Failed', err.message);
                this.loading = false;
            }
        });
    }

    close() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.readinessData = null;
        this.executionResult = null;
    }
}
