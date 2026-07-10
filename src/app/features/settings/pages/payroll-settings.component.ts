import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { PayrollRulesService } from '../services/payroll-rules.service';
import { CommonInputComponent } from '../../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../../shared/components/common-select/common-select.component';
import { CommonButtonComponent } from '../../../shared/components/common-button.component/common-button.component';
import { NotificationService } from '../../../core/services/notification.service';
import { PayrollAuditTableComponent } from './components/payroll-audit-table.component';
import { ManualPayrollModalComponent } from './components/manual-payroll-modal.component';
import { PayrollComponentsSettingsComponent } from './components/payroll-components-settings.component';
import { PayrollTemplatesSettingsComponent } from './components/payroll-templates-settings.component';
import { TabsModule } from 'primeng/tabs';

@Component({
    selector: 'app-payroll-settings',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, CommonInputComponent, 
        CommonSelectComponent, CommonButtonComponent, TabsModule,
        PayrollAuditTableComponent, ManualPayrollModalComponent,
        PayrollComponentsSettingsComponent, PayrollTemplatesSettingsComponent
    ],
    template: `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Payroll Engine</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure components templates, scheduling, and automatic runs.</p>
        </div>

        <p-tabs value="rules">
            <p-tablist>
                <p-tab value="rules">Configuration Rules</p-tab>
                <p-tab value="components">Salary Components</p-tab>
                <p-tab value="templates">Salary Templates</p-tab>
                <p-tab value="audit">Execution & Audit Logs</p-tab>
            </p-tablist>
            
            <p-tabpanels>
                <p-tabpanel value="rules">
                    <p-card class="!shadow-none !border-slate-300 dark:!border-slate-800 mt-4">
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                <!-- Frequency & Mode -->
                                <div class="col-span-1 md:col-span-2">
                                    <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Schedule Settings</h3>
                                </div>
                                <app-common-select label="Frequency Type" [options]="frequencyOptions" [(ngModel)]="form.frequencyType" placeholder="Select frequency..."></app-common-select>
                                <app-common-select label="Processing Mode" [options]="modeOptions" [(ngModel)]="form.processingMode" placeholder="Select mode..."></app-common-select>
                                
                                <!-- Dates -->
                                <div class="col-span-1 md:col-span-2 mt-4">
                                    <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Date Configuration</h3>
                                </div>
                                <app-common-select label="Payroll Date Type" [options]="dateTypeOptions" [(ngModel)]="form.payrollDateType" placeholder="Select date type..."></app-common-select>
                                
                                <ng-container *ngIf="form.payrollDateType === 'FixedDate'">
                                    <app-common-input label="Payroll Date (Day of Month)" [(ngModel)]="form.payrollDate" placeholder="e.g. 30" icon="pi pi-calendar" type="number"></app-common-input>
                                </ng-container>

                                <app-common-input label="Attendance Cutoff (Day of Month)" [(ngModel)]="form.attendanceCutoffDate" placeholder="e.g. 25" icon="pi pi-calendar-times" type="number"></app-common-input>

                                <!-- Calculation rules -->
                                <div class="col-span-1 md:col-span-2 mt-4">
                                    <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Calculation & Policies</h3>
                                </div>
                                <app-common-select label="Salary Calculation Method" [options]="calcMethodOptions" [(ngModel)]="form.salaryCalculationMethod" placeholder="Select method..."></app-common-select>
                                
                                <div class="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div class="flex items-center gap-4 mt-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <input type="checkbox" id="autoProcess" [(ngModel)]="form.autoProcessEnabled" class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300">
                                        <div>
                                            <label for="autoProcess" class="font-semibold text-slate-800 dark:text-slate-200 block">Enable Scheduler</label>
                                            <p class="text-xs text-slate-500 mt-1">Run cron job automatically</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4 mt-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <input type="checkbox" id="incWeekends" [(ngModel)]="form.includeWeekends" class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300">
                                        <div>
                                            <label for="incWeekends" class="font-semibold text-slate-800 dark:text-slate-200 block">Include Weekends</label>
                                            <p class="text-xs text-slate-500 mt-1">Count weekends as paid</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4 mt-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <input type="checkbox" id="incHolidays" [(ngModel)]="form.includeHolidays" class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300">
                                        <div>
                                            <label for="incHolidays" class="font-semibold text-slate-800 dark:text-slate-200 block">Include Holidays</label>
                                            <p class="text-xs text-slate-500 mt-1">Count holidays as paid</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-6 flex justify-end">
                                <app-button label="Save Configuration" icon="pi pi-save" variant="primary" (onClick)="save()" [loading]="saving"></app-button>
                            </div>
                        </div>
                    </p-card>
                </p-tabpanel>

                <p-tabpanel value="components">
                    <div class="mt-4">
                        <app-payroll-components-settings></app-payroll-components-settings>
                    </div>
                </p-tabpanel>

                <p-tabpanel value="templates">
                    <div class="mt-4">
                        <app-payroll-templates-settings></app-payroll-templates-settings>
                    </div>
                </p-tabpanel>

                <p-tabpanel value="audit">
                    <div class="mt-4 flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Run History</h3>
                            <p class="text-sm text-slate-500">Track all automated and manual payroll executions.</p>
                        </div>
                        <app-button label="Manual Run" icon="pi pi-play" variant="secondary" (onClick)="showManualModal = true"></app-button>
                    </div>
                    
                    <app-payroll-audit-table [refreshTrigger]="refreshAudit"></app-payroll-audit-table>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>

        <app-manual-payroll-modal 
            [(visible)]="showManualModal" 
            (onSuccess)="triggerAuditRefresh()">
        </app-manual-payroll-modal>
    `
})
export class PayrollSettingsComponent implements OnInit {
    private service = inject(PayrollRulesService);
    private notify = inject(NotificationService);

    saving = false;
    showManualModal = false;
    refreshAudit = 0;

    form: any = {
        frequencyType: 'Monthly',
        processingMode: 'Automatic',
        payrollDateType: 'FixedDate',
        payrollDate: 30,
        attendanceCutoffDate: 25,
        salaryCalculationMethod: 'ActualCalendarDays',
        includeWeekends: false,
        includeHolidays: true,
        autoProcessEnabled: false,
        isActive: true
    };

    frequencyOptions = [
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Bi-Weekly', value: 'Bi-Weekly' },
        { label: 'Semi-Monthly', value: 'Semi-Monthly' },
        { label: 'Monthly', value: 'Monthly' }
    ];

    modeOptions = [
        { label: 'Automatic (Cron)', value: 'Automatic' },
        { label: 'Manual Trigger', value: 'Manual' }
    ];

    dateTypeOptions = [
        { label: 'Fixed Date', value: 'FixedDate' },
        { label: 'Last Working Day', value: 'LastWorkingDay' },
        { label: 'Last Calendar Day', value: 'LastCalendarDay' }
    ];

    calcMethodOptions = [
        { label: 'Fixed 30 Days', value: 'Fixed30Days' },
        { label: 'Actual Calendar Days', value: 'ActualCalendarDays' },
        { label: 'Working Days Based', value: 'WorkingDaysBased' }
    ];

    ngOnInit() {
        this.loadRule();
    }

    loadRule() {
        this.service.getRule().subscribe({
            next: (res: any) => {
                if (res) this.form = { ...this.form, ...res };
            },
            error: (err: any) => this.notify.error('Failed to load payroll rules', err.message)
        });
    }

    save() {
        this.saving = true;
        this.service.upsertRule(this.form).subscribe({
            next: (res: any) => {
                this.saving = false;
                this.notify.success('Rules Updated', 'Payroll configuration saved successfully');
            },
            error: (err: any) => {
                this.saving = false;
                this.notify.error('Failed to save rules', err.message);
            }
        });
    }

    triggerAuditRefresh() {
        this.refreshAudit++;
    }
}
