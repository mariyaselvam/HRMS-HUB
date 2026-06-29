import { Component, inject, OnInit, signal, effect, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceStore } from '../../store/attendance.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonRangePickerComponent } from '../../shared/components/datepicker/common-range-picker/common-range-picker.component';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';

@Component({
    selector: 'app-employee-attendance',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        PopoverModule,
        CommonTableComponent,
        CommonInputComponent,
        CommonSelectComponent,
        CommonRangePickerComponent,
    ],
    templateUrl: './employee-attendance.component.html'
})
export class EmployeeAttendanceComponent {
    protected store = inject(AttendanceStore);

    // Filters
    search = signal('');
    status = signal<string | null>(null);
    dateRange = signal<Date[] | null>(null);

    activeFilterCount = computed(() => {
        let count = 0;
        if (this.search()) count++;
        if (this.status()) count++;
        if (this.dateRange() && this.dateRange()![0]) count++;
        return count;
    });

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Present', value: 'present' },
        { label: 'Late', value: 'late' },
        { label: 'Absent', value: 'absent' },
        { label: 'Half Day', value: 'half-day' }
    ];

    columns: Column[] = [
        { field: 'employee.user.email', header: 'Employee' },
        { field: 'shift.name', header: 'Shift' },
        { field: 'attendanceDate', header: 'Date', type: 'date' },
        { field: 'checkIn', header: 'Check In', type: 'time' },
        { field: 'checkOut', header: 'Check Out', type: 'time' },
        { field: 'totalHours', header: 'Hours', type: 'duration' },
        { field: 'status', header: 'Status', type: 'status' }
    ];

    private getFilters(page?: number) {
        const dates = this.dateRange();
        return {
            search: this.search() || undefined,
            status: (this.status() as any) || undefined,
            startDate: dates?.[0]?.toISOString().split('T')[0],
            endDate: dates?.[1]?.toISOString().split('T')[0],
            page: page ?? untracked(() => this.store.page()),
            limit: untracked(() => this.store.limit())
        };
    }

    constructor() {
        effect(() => {
            this.search();
            this.status();
            this.dateRange();
            const filters = untracked(() => this.getFilters(1));
            this.store.loadAdminLogs(filters);
        });
    }

    onLazyLoad(event: any) {
        const page = (event.first / event.rows) + 1;
        const limit = event.rows;

        if (this.store.loading() || (this.store.page() === page && this.store.limit() === limit && this.store.logs().length > 0)) {
            return;
        }

        const filters = {
            ...this.getFilters(),
            page,
            limit
        };

        this.store.loadAdminLogs(filters);
    }
}
