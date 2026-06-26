import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SettingsStore } from '../../../store/settings.store';
import { CommonButtonComponent } from '../../../shared/components/common-button.component/common-button.component';

@Component({
    selector: 'app-notification-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, CommonButtonComponent],
    template: `
        <p-card class="!shadow-none !border-slate-300 dark:!border-slate-800">
            <div class="p-6">
                <div class="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Notification Settings</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Setup triggers and alert behaviors for events.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    
                    <div class="col-span-1 md:col-span-2 space-y-4">
                        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <input type="checkbox" id="emailLeave" [(ngModel)]="form.emailLeaveRequest" class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300">
                            <div class="flex-1">
                                <label for="emailLeave" class="font-semibold text-slate-800 dark:text-slate-200 block cursor-pointer">Email Leave Requests</label>
                                <p class="text-xs text-slate-500 mt-1">Notify managers and HR when a new leave is triggered.</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <input type="checkbox" id="emailSalary" [(ngModel)]="form.emailSalarySlip" class="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 bg-white border-slate-300">
                            <div class="flex-1">
                                <label for="emailSalary" class="font-semibold text-slate-800 dark:text-slate-200 block cursor-pointer">Email Salary Slips</label>
                                <p class="text-xs text-slate-500 mt-1">Automatically blast payslips when cycle is closed.</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <input type="checkbox" id="emailLate" [(ngModel)]="form.emailLateAttendance" class="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 bg-white border-slate-300">
                            <div class="flex-1">
                                <label for="emailLate" class="font-semibold text-slate-800 dark:text-slate-200 block cursor-pointer">Email Late Attendance</label>
                                <p class="text-xs text-slate-500 mt-1">Trigger an email to HR if an employee is continuously late.</p>
                            </div>
                        </div>
                    </div>
                    
                </div>

                <div class="mt-6 flex justify-end">
                    <app-button label="Save Configurations" icon="pi pi-save" variant="primary" (onClick)="save()" [loading]="store.saving()"></app-button>
                </div>
            </div>
        </p-card>
    `
})
export class NotificationSettingsComponent {
    protected store = inject(SettingsStore);
    private cdr = inject(ChangeDetectorRef);
    settingsCategory = 'notifications';

    form = {
        emailLeaveRequest: true,
        emailSalarySlip: true,
        emailLateAttendance: false
    };

    constructor() {
        const catSettings = this.store.getCategorySettings(this.settingsCategory);
        effect(() => {
            const data = catSettings();
            if (data && Object.keys(data).length > 0) {
                setTimeout(() => {
                    this.form = { ...this.form, ...data };
                    this.cdr.detectChanges();
                });
            }
        });
    }

    save() {
        this.store.updateCategorySettings(this.settingsCategory, this.form);
    }
}
