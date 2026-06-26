import { Component, inject, effect, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SettingsStore } from '../../../store/settings.store';
import { CommonInputComponent } from '../../../shared/components/common-input/common-input.component';
import { CommonButtonComponent } from '../../../shared/components/common-button.component/common-button.component';

@Component({
    selector: 'app-company-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, CommonInputComponent, CommonButtonComponent],
    template: `
        <p-card class="!shadow-none !border-slate-300 dark:!border-slate-800">
            <div class="p-6">
                <div class="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Company Profile</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage standard company configurations.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <app-common-input label="Company Name" [(ngModel)]="form.companyName" placeholder="Enter company name..." icon="pi pi-building"></app-common-input>
                    <app-common-input label="Contact Email" [(ngModel)]="form.hrEmail" placeholder="HR contact email..." icon="pi pi-envelope" type="email"></app-common-input>
                </div>

                <div class="mt-6 flex justify-end">
                    <app-button label="Save Changes" icon="pi pi-save" variant="primary" (onClick)="save()" [loading]="store.saving()"></app-button>
                </div>
            </div>
        </p-card>
    `
})
export class CompanySettingsComponent {
    protected store = inject(SettingsStore);
    private cdr = inject(ChangeDetectorRef);
    settingsCategory = 'company';

    // Form model
    form = {
        companyName: '',
        hrEmail: ''
    };

    constructor() {
        const catSettings = this.store.getCategorySettings(this.settingsCategory);
        effect(() => {
            const data = catSettings();
            if (data && Object.keys(data).length > 0) {
                // Wrap in setTimeout to avoid NG0100: ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.form = {
                        companyName: data.companyName || '',
                        hrEmail: data.hrEmail || ''
                    };
                    this.cdr.detectChanges();
                });
            }
        });
    }

    save() {
        this.store.updateCategorySettings(this.settingsCategory, this.form);
    }
}
