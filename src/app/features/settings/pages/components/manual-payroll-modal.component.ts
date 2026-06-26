import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CommonButtonComponent } from '../../../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../../../shared/components/common-input/common-input.component';
import { PayrollRulesService } from '../../services/payroll-rules.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-manual-payroll-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, CommonButtonComponent, CommonInputComponent],
    template: `
        <p-dialog 
            header="Trigger Manual Payroll" 
            [(visible)]="visible" 
            [modal]="true" 
            [style]="{width: '500px'}" 
            [draggable]="false" 
            [resizable]="false"
            (onHide)="close()">
            
            <div class="py-4">
                <p class="text-sm text-slate-500 mb-4">Enter the payroll period to preview and execute a manual payroll run.</p>
                
                <app-common-input 
                    label="Payroll Period (YYYY-MM)" 
                    [(ngModel)]="period" 
                    placeholder="e.g. 2026-05" 
                    icon="pi pi-calendar">
                </app-common-input>

                <div *ngIf="previewData" class="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <h4 class="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Preview Summary</h4>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-slate-600 dark:text-slate-400">Total Employees</span>
                        <span class="font-medium">{{ previewData.employeeCount }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600 dark:text-slate-400">Estimated Payout</span>
                        <span class="font-medium font-mono text-indigo-700 dark:text-indigo-300">{{ previewData.estimatedTotal | number:'1.2-2' }}</span>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <app-button label="Cancel" variant="ghost" (onClick)="close()"></app-button>
                <app-button *ngIf="!previewData" label="Preview" variant="secondary" icon="pi pi-eye" (onClick)="preview()" [loading]="loading"></app-button>
                <app-button *ngIf="previewData" label="Execute Payroll" variant="primary" icon="pi pi-play" (onClick)="execute()" [loading]="loading"></app-button>
            </ng-template>
        </p-dialog>
    `
})
export class ManualPayrollModalComponent {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onSuccess = new EventEmitter<void>();

    private service = inject(PayrollRulesService);
    private notify = inject(NotificationService);

    period = '';
    previewData: any = null;
    loading = false;

    preview() {
        if (!this.period) {
            this.notify.error('Validation Error', 'Please enter a valid period');
            return;
        }

        this.loading = true;
        this.service.previewRun(this.period).subscribe({
            next: (res: any) => {
                this.previewData = res;
                this.loading = false;
            },
            error: (err: any) => {
                this.notify.error('Preview Failed', err.message);
                this.loading = false;
            }
        });
    }

    execute() {
        this.loading = true;
        this.service.executeRun({ period: this.period, runType: 'Manual' }).subscribe({
            next: (res: any) => {
                this.notify.success('Success', 'Payroll executed successfully');
                this.loading = false;
                this.onSuccess.emit();
                this.close();
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
        this.previewData = null;
        this.period = '';
    }
}
