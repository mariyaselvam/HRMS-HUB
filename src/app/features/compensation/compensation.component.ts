import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CompensationService, CompensationCycle, SalaryRevision } from '../../core/services/compensation.service';
import { DepartmentStore } from '../../store/department.store';
import { NotificationService } from '../../core/services/notification.service';
import { CommonDatePickerComponent } from '../../shared/components/datepicker/common-date-picker/common-date-picker.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-compensation',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        DialogModule,
        SelectModule,
        InputTextModule,
        ButtonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CommonDatePickerComponent
    ],
    templateUrl: './compensation.component.html'
})
export class CompensationComponent implements OnInit {
    private service = inject(CompensationService);
    private deptStore = inject(DepartmentStore);
    private notify = inject(NotificationService);

    // States
    cycles = signal<CompensationCycle[]>([]);
    selectedCycleId = signal<string | null>(null);
    revisions = signal<SalaryRevision[]>([]);
    loading = signal<boolean>(false);
    
    // Departments from store
    departments = this.deptStore.departments;

    // Create Cycle Modal State
    showCreateDialog = signal<boolean>(false);
    newCycleName = signal<string>('');
    newCycleEffectiveFrom = signal<string>('');

    // Bulk Hike Modal State
    showBulkDialog = signal<boolean>(false);
    bulkDepartmentId = signal<string | null>(null);
    bulkAdjustmentType = signal<'percentage' | 'fixed'>('percentage');
    bulkValue = signal<number | null>(null);

    tableColumns: Column[] = [
        { field: 'employeeName', header: 'Employee' },
        { field: 'employeeCode', header: 'Code' },
        { field: 'department', header: 'Department' },
        { field: 'currentGross', header: 'Current Gross', type: 'number' },
        { field: 'proposedGross', header: 'Proposed Gross', type: 'number' },
        { field: 'changePct', header: '% Change' },
        { field: 'costDiff', header: 'Monthly Impact', type: 'number' }
    ];

    processedRevisions = computed(() => {
        return this.revisions().map(rev => {
            const pct = rev.currentGross > 0
                ? ((rev.proposedGross - rev.currentGross) / rev.currentGross) * 100
                : 0;
            return {
                ...rev,
                employeeName: `${rev.employee?.personalDetails?.firstName || ''} ${rev.employee?.personalDetails?.lastName || ''}`.trim(),
                employeeCode: rev.employee?.employeeCode || 'N/A',
                department: rev.employee?.department?.name || 'N/A',
                changePct: `+${pct.toFixed(1)}%`,
                costDiff: rev.proposedGross - rev.currentGross
            };
        });
    });

    activeCycle = computed(() => {
        return this.cycles().find(c => c.id === this.selectedCycleId());
    });

    avgHike = computed(() => {
        const revs = this.revisions();
        if (revs.length === 0) return 0;
        const totalPct = revs.reduce((sum, rev) => {
            const pct = rev.currentGross > 0
                ? (rev.proposedGross - rev.currentGross) / rev.currentGross
                : 0;
            return sum + pct;
        }, 0);
        return totalPct / revs.length;
    });

    monthlyCostImpact = computed(() => {
        return this.revisions().reduce((sum, rev) => sum + (rev.proposedGross - rev.currentGross), 0);
    });

    ngOnInit() {
        this.deptStore.loadDepartments();
        this.loadCycles();
    }

    loadCycles() {
        this.loading.set(true);
        this.service.getCycles()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (cycles) => {
                    this.cycles.set(cycles);
                    if (cycles.length > 0 && !this.selectedCycleId()) {
                        this.selectedCycleId.set(cycles[0].id);
                        this.loadRevisions();
                    }
                },
                error: (err) => this.notify.error('Error', 'Failed to load compensation cycles')
            });
    }

    loadRevisions() {
        const cycleId = this.selectedCycleId();
        if (!cycleId) return;

        this.loading.set(true);
        this.service.getCycleRevisions(cycleId)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (cycle) => {
                    this.revisions.set(cycle.revisions || []);
                },
                error: (err) => this.notify.error('Error', 'Failed to load cycle revisions')
            });
    }

    onCycleChange() {
        this.loadRevisions();
    }

    onCreateCycle() {
        const name = this.newCycleName();
        const date = this.newCycleEffectiveFrom();

        this.loading.set(true);
        this.service.createCycle(name, date)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (newCycle) => {
                    this.notify.success('Success', `Cycle ${name} created`);
                    this.showCreateDialog.set(false);
                    this.newCycleName.set('');
                    this.newCycleEffectiveFrom.set('');
                    
                    // Reload & select the new cycle
                    this.selectedCycleId.set(newCycle.id);
                    this.loadCycles();
                },
                error: (err) => this.notify.error('Error', err.error?.message || 'Failed to create cycle')
            });
    }

    onApplyBulkUpdate() {
        const cycleId = this.selectedCycleId();
        const val = this.bulkValue();
        if (!cycleId || val === null) return;

        const payload = {
            filters: this.bulkDepartmentId() ? { departmentId: this.bulkDepartmentId()! } : {},
            incrementType: this.bulkAdjustmentType(),
            value: val
        };

        this.loading.set(true);
        this.service.bulkUpdateRevisions(cycleId, payload)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res) => {
                    this.notify.success('Success', `Proposed increment computed for ${res.computedCount} employees`);
                    this.showBulkDialog.set(false);
                    this.bulkValue.set(null);
                    this.loadRevisions();
                },
                error: (err) => this.notify.error('Error', err.error?.message || 'Failed to apply bulk update')
            });
    }

    onApplyCycle() {
        const cycleId = this.selectedCycleId();
        if (!cycleId) return;

        if (!confirm('Are you sure you want to approve and finalize this revision cycle? This will modify and create active salary structures for all revised employees.')) {
            return;
        }

        this.loading.set(true);
        this.service.applyCycle(cycleId)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res) => {
                    this.notify.success('Revisions Applied', `Successfully applied salary structures for ${res.appliedCount} employees.`);
                    this.loadCycles(); // Refreshes status from database
                    this.loadRevisions();
                },
                error: (err) => this.notify.error('Error', err.error?.message || 'Failed to apply revisions')
            });
    }
}
