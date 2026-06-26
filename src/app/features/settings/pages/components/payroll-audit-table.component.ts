import { Component, Input, OnChanges, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonTableComponent, Column } from '../../../../shared/components/common-table/common-table.component';
import { PayrollRulesService } from '../../services/payroll-rules.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-payroll-audit-table',
    standalone: true,
    imports: [CommonModule, CommonTableComponent],
    template: `
        <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <app-common-table 
                [data]="runs" 
                [columns]="columns" 
                [loading]="loading"
                [rows]="10">
            </app-common-table>
        </div>
    `
})
export class PayrollAuditTableComponent implements OnChanges {
    @Input() refreshTrigger = 0;
    
    private service = inject(PayrollRulesService);
    private notify = inject(NotificationService);

    runs: any[] = [];
    loading = false;

    columns: Column[] = [
        { field: 'payrollPeriod', header: 'Period', type: 'text' },
        { field: 'runType', header: 'Run Type', type: 'text' },
        { field: 'startedAt', header: 'Started At', type: 'datetime' },
        { field: 'status', header: 'Status', type: 'status' },
        { field: 'employeeCount', header: 'Employees', type: 'text' },
        { field: 'totalAmount', header: 'Total Amount', type: 'number' }
    ];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['refreshTrigger']) {
            this.loadRuns();
        }
    }

    loadRuns() {
        this.loading = true;
        this.service.getRuns().subscribe({
            next: (res: any) => {
                this.runs = res || [];
                this.loading = false;
            },
            error: (err: any) => {
                this.notify.error('Failed to load runs', err.message);
                this.loading = false;
            }
        });
    }
}
