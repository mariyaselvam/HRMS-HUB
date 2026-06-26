import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HolidayStore } from '../../store/holiday.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonDatePickerComponent } from '../../shared/components/datepicker/common-date-picker/common-date-picker.component';
import { Holiday } from '../../core/models/holiday.model';
import { NotificationService } from '../../core/services/notification.service';
import { ContextStore } from '../../store/context.store';

@Component({
    selector: 'app-holiday-list',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CardModule,
        DialogModule,
        CheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        CommonInputComponent,
        CommonDatePickerComponent
    ],
    templateUrl: './holiday-list.component.html'
})
export class HolidayListComponent {
    protected store = inject(HolidayStore);
    protected contextStore = inject(ContextStore);
    private fb = inject(FormBuilder);
    private notify = inject(NotificationService);

    showDialog = false;
    submitted = false;
    isAllBranchesMode = false;

    columns: Column[] = [
        { field: 'date', header: 'Date', type: 'date' },
        { field: 'name', header: 'Holiday Name' },
        { field: 'workLocation.name', header: 'Branch' },
        { field: 'isOptional', header: 'Type', type: 'boolean' }
    ];

    form = this.fb.group({
        name: ['', [Validators.required]],
        date: [null as any, [Validators.required]],
        isOptional: [false]
    });

    constructor() {
        effect(() => {
            const branchId = this.contextStore.activeBranchId();
            this.store.loadHolidays(branchId || undefined);
        });
    }

    openAddDialog() {
        const activeBranch = this.contextStore.activeBranchId();
        if (!activeBranch) {
            this.notify.confirm(
                'This will create this holiday for all branches. Are you sure?',
                'Create Holiday for All Branches',
                () => {
                    this.isAllBranchesMode = true;
                    this.form.reset({ isOptional: false });
                    this.submitted = false;
                    this.showDialog = true;
                }
            );
        } else {
            this.isAllBranchesMode = false;
            this.form.reset({ isOptional: false });
            this.submitted = false;
            this.showDialog = true;
        }
    }

    onDelete(holiday: Holiday) {
        this.notify.confirmDelete(holiday.name, () => {
            this.store.deleteHoliday(holiday.id);
        });
    }

    onSubmit() {
        this.submitted = true;
        if (this.form.valid) {
            if (this.isAllBranchesMode) {
                const val = {
                    ...this.form.value,
                    workLocationId: null,
                    allBranches: true
                };
                this.store.addHoliday(val as any);
                this.showDialog = false;
            } else {
                const activeBranch = this.contextStore.activeBranchId();
                const val = {
                    ...this.form.value,
                    workLocationId: activeBranch
                };
                this.store.addHoliday(val as any);
                this.showDialog = false;
            }
        }
    }

    getErrorMessage(controlName: string): string | null {
        if (!this.submitted) return null;
        const control = this.form.get(controlName);
        if (control?.errors?.['required']) {
            if (controlName === 'name') return 'Holiday name is required';
            if (controlName === 'date') return 'Date is required';
        }
        return null;
    }
}
