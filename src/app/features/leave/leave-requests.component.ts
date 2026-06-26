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
import { CommonDatePickerComponent } from '../../shared/components/datepicker/common-date-picker/common-date-picker.component';

@Component({
    selector: 'app-leave-requests',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CardModule,
        DialogModule,
        ReactiveFormsModule,
        CommonInputComponent,
        CommonSelectComponent,
        CommonDatePickerComponent
    ],
    templateUrl: './leave-requests.component.html'
})
export class LeaveRequestsComponent implements OnInit {
    protected store = inject(LeaveStore);
    private fb = inject(FormBuilder);

    showDialog = false;
    submitted = false;

    columns: Column[] = [
        { field: 'leaveType.name', header: 'Type' },
        { field: 'startDate', header: 'From', type: 'date' },
        { field: 'endDate', header: 'To', type: 'date' },
        { field: 'appliedDays', header: 'Days' },
        { field: 'status', header: 'Status', type: 'status' }
    ];

    form = this.fb.group({
        leaveTypeId: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        reason: ['', [Validators.required]]
    });

    ngOnInit() {
        this.store.loadMyRequests();
        this.store.loadLeaveTypes();
    }

    openApplyDialog() {
        this.form.reset();
        this.submitted = false;
        this.showDialog = true;
    }

    onApply() {
        this.submitted = true;
        if (this.form.valid) {
            this.store.applyLeave(this.form.value as any);
            this.showDialog = false;
        }
    }

    getErrorMessage(controlName: string): string | null {
        if (!this.submitted) return null;
        const control = this.form.get(controlName);
        if (control?.errors?.['required']) return 'This field is required';
        return null;
    }
}
