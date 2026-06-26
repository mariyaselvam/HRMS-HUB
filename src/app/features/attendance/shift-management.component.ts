import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceStore } from '../../store/attendance.store';
import { EmployeeStore } from '../../store/employee.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonDatePickerComponent } from '../../shared/components/datepicker/common-date-picker/common-date-picker.component';
import { CommonTimePickerComponent } from '../../shared/components/datepicker/common-time-picker/common-time-picker.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateShiftInput, AssignShiftInput } from '../../core/models/attendance.model';

@Component({
    selector: 'app-shift-management',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CommonInputComponent,
        CommonSelectComponent,
        CommonDatePickerComponent,
        CommonTimePickerComponent,
        CardModule,
        DialogModule,
        ReactiveFormsModule
    ],
    templateUrl: './shift-management.component.html'
})
export class ShiftManagementComponent implements OnInit {
    private fb = inject(FormBuilder);
    protected store = inject(AttendanceStore);
    protected employeeStore = inject(EmployeeStore);

    showCreateShift = false;
    showAssignShift = false;

    shiftForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        startTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
        endTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
        graceMinutes: [15, [Validators.min(0), Validators.max(60)]]
    });

    assignForm: FormGroup = this.fb.group({
        employeeId: ['', Validators.required],
        shiftId: ['', Validators.required],
        effectiveFrom: [new Date().toISOString().split('T')[0], Validators.required]
    });

    columns: Column[] = [
        { field: 'name', header: 'Shift Name' },
        { field: 'startTime', header: 'Start Time', type: 'text' },
        { field: 'endTime', header: 'End Time', type: 'text' },
        { field: 'graceMinutes', header: 'Grace (Mins)' },
        { field: 'createdAt', header: 'Created', type: 'date' }
    ];

    ngOnInit() {
        this.store.loadShifts();
        this.employeeStore.loadEmployees();
    }

    get employeeOptions() {
        return this.employeeStore.employees().map(e => ({
            label: `${e.personalDetails?.firstName || ''} ${e.personalDetails?.lastName || ''} (${e.employeeCode})`.trim() || e.email,
            value: e.id
        }));
    }

    get shiftOptions() {
        return this.store.shifts().map(s => ({
            label: s.name,
            value: s.id
        }));
    }

    onCreateShift() {
        if (this.shiftForm.valid) {
            this.store.createShift(this.shiftForm.value as CreateShiftInput);
            this.showCreateShift = false;
            this.shiftForm.reset({ graceMinutes: 15 });
        }
    }

    onAssignShift() {
        if (this.assignForm.valid) {
            this.store.assignShift(this.assignForm.value as AssignShiftInput);
            this.showAssignShift = false;
            this.assignForm.reset({ effectiveFrom: new Date().toISOString().split('T')[0] });
        }
    }
}
