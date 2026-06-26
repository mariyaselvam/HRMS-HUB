import { Component, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveStore } from '../../store/leave.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { getLeaveRequestEmployeeLabel, LeaveRequest } from '../../core/models/leave.model';
import { ContextStore } from '../../store/context.store';

@Component({
    selector: 'app-leave-approvals',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CardModule,
        DialogModule,
        ReactiveFormsModule,
        CommonInputComponent
    ],
    templateUrl: './leave-approvals.component.html'
})
export class LeaveApprovalsComponent {
    protected store = inject(LeaveStore);
    protected contextStore = inject(ContextStore);
    private fb = inject(FormBuilder);

    selectedRequest: LeaveRequest | null = null;
    showDialog = false;
    submitted = false;

    protected tableData = computed(() =>
        this.store.allRequests().map((request) => ({
            ...request,
            employeeLabel: getLeaveRequestEmployeeLabel(request.employee),
        }))
    );

    protected getEmployeeLabel = getLeaveRequestEmployeeLabel;

    columns: Column[] = [
        { field: 'employeeLabel', header: 'Employee' },
        { field: 'leaveType.name', header: 'Type' },
        { field: 'startDate', header: 'From', type: 'date' },
        { field: 'endDate', header: 'To', type: 'date' },
        { field: 'appliedDays', header: 'Days' },
        { field: 'status', header: 'Status', type: 'status' }
    ];

    form = this.fb.group({
        remarks: ['']
    });

    constructor() {
        effect(() => {
            const branchId = this.contextStore.activeBranchId();
            this.store.loadAllRequests(branchId || undefined);
        });
    }

    openReviewDialog(request: LeaveRequest) {
        this.selectedRequest = request;
        this.form.reset();
        this.showDialog = true;
    }

    onAction(status: 'approved' | 'rejected') {
        if (this.selectedRequest) {
            this.store.handleLeaveAction(this.selectedRequest.id, {
                status,
                remarks: this.form.value.remarks || ''
            });
            this.showDialog = false;
        }
    }
}
