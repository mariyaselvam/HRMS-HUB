import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveStore } from '../../store/leave.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { NotificationService } from '../../core/services/notification.service';
import { ContextStore } from '../../store/context.store';

@Component({
    selector: 'app-leave-types',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CardModule,
        DialogModule,
        ReactiveFormsModule,
        CommonInputComponent,
        CommonSelectComponent
    ],
    templateUrl: './leave-types.component.html'
})
export class LeaveTypesComponent implements OnInit {
    protected store = inject(LeaveStore);
    protected contextStore = inject(ContextStore);
    private fb = inject(FormBuilder);
    private notify = inject(NotificationService);

    showDialog = false;
    submitted = false;
    isAllBranchesMode = false;

    columns: Column[] = [
        { field: 'name', header: 'Leave Type' },
        { field: 'daysAllowed', header: 'Days Per Year' },
        { field: 'isPaid', header: 'Type', type: 'status' } // Using status type for Pill look
    ];

    form = this.fb.group({
        name: ['', [Validators.required]],
        description: [''],
        daysAllowed: [0, [Validators.required, Validators.min(1)]],
        isPaid: [true, [Validators.required]]
    });

    paidOptions = [
        { label: 'Paid', value: true },
        { label: 'Unpaid', value: false }
    ];

    ngOnInit() {
        this.store.loadLeaveTypes();
    }

    openAddDialog() {
        const activeBranch = this.contextStore.activeBranchId();
        if (!activeBranch) {
            this.notify.confirm(
                'This will create this leave type for all branches. Are you sure?',
                'Create Leave Type for All Branches',
                () => {
                    this.isAllBranchesMode = true;
                    this.form.reset({ isPaid: true, daysAllowed: 10 });
                    this.submitted = false;
                    this.showDialog = true;
                }
            );
        } else {
            this.isAllBranchesMode = false;
            this.form.reset({ isPaid: true, daysAllowed: 10 });
            this.submitted = false;
            this.showDialog = true;
        }
    }

    onSave() {
        this.submitted = true;
        if (this.form.valid) {
            this.store.createLeaveType(this.form.value as any);
            this.showDialog = false;
        }
    }

    getErrorMessage(controlName: string): string | null {
        if (!this.submitted) return null;
        const control = this.form.get(controlName);
        if (control?.errors?.['required']) return 'This field is required';
        if (control?.errors?.['min']) return 'Must be at least 1 day';
        return null;
    }
}
