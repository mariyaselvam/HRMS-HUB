import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { PayrollRulesService } from '../services/payroll-rules.service';
import { LocationStore } from '../../../store/location.store';
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
                            <!-- Hierarchical Scope Switcher -->
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 mb-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <i class="pi pi-sitemap text-lg"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-bold text-slate-800 dark:text-white">Rule Scope Target</h4>
                                        <p class="text-xs text-slate-500">Configure Company Master Default or a Branch Override</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 w-full sm:w-auto">
                                    <select [(ngModel)]="selectedLocationScope" (ngModelChange)="onScopeChange($event)"
                                        class="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full sm:w-64">
                                        <option value="">🏢 Company Master Default (Corporate Root)</option>
                                        <optgroup label="Branch Specific Overrides">
                                            <option *ngFor="let loc of locationStore.locations()" [value]="loc.id">
                                                📍 {{ loc.name }} {{ loc.cluster ? '(' + loc.cluster.name + ')' : '' }}
                                            </option>
                                        </optgroup>
                                    </select>
                                    <span *ngIf="selectedLocationScope && isInherited" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                        <i class="pi pi-link mr-1"></i> Inheriting Master
                                    </span>
                                    <span *ngIf="selectedLocationScope && !isInherited" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                                        <i class="pi pi-check-circle mr-1"></i> Custom Override
                                    </span>
                                    <span *ngIf="!selectedLocationScope" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                                        <i class="pi pi-shield mr-1"></i> Company Default
                                    </span>
                                </div>
                            </div>

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

                            <div class="mt-6 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4">
                                <span class="text-xs text-slate-500">
                                    Editing: <b class="text-slate-700 dark:text-slate-300">{{ selectedLocationScope ? 'Branch Override' : 'Company Master Default' }}</b>
                                </span>
                                <app-button [label]="selectedLocationScope ? 'Save Branch Override' : 'Save Master Configuration'" icon="pi pi-save" variant="primary" (onClick)="save()" [loading]="saving"></app-button>
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
                            <p class="text-sm text-slate-500">Track all automated, manual, and multi-branch batch payroll executions.</p>
                        </div>
                        <app-button label="Eagle-Eye Payroll Run" icon="pi pi-bolt" variant="primary" (onClick)="showManualModal = true"></app-button>
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
    protected locationStore = inject(LocationStore);

    saving = false;
    showManualModal = false;
    refreshAudit = 0;
    selectedLocationScope = '';
    isInherited = false;

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
        this.locationStore.loadLocations();
        this.loadRule();
    }

    onScopeChange(locationId: string) {
        this.selectedLocationScope = locationId;
        this.loadRule();
    }

    loadRule() {
        this.service.getRule(this.selectedLocationScope || undefined, true).subscribe({
            next: (res: any) => {
                if (res) {
                    this.form = { ...this.form, ...res };
                    this.isInherited = Boolean(res.isInherited);
                } else {
                    this.isInherited = Boolean(this.selectedLocationScope);
                }
            },
            error: (err: any) => this.notify.error('Failed to load payroll rules', err.message)
        });
    }

    save() {
        this.saving = true;
        this.service.upsertRule(this.form, this.selectedLocationScope || undefined).subscribe({
            next: (res: any) => {
                this.saving = false;
                this.isInherited = false;
                this.notify.success(
                    'Rules Updated',
                    this.selectedLocationScope
                        ? 'Branch override configuration saved successfully'
                        : 'Company Master Default saved successfully'
                );
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
