import { Component, inject, OnInit, OnDestroy, signal, effect, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceStore } from '../../store/attendance.store';
import { AuthService } from '../../core/services/auth.service';
import { ShiftManagementComponent } from './shift-management.component';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonRangePickerComponent } from '../../shared/components/datepicker/common-range-picker/common-range-picker.component';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        PopoverModule,
        ButtonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CommonInputComponent,
        CommonSelectComponent,
        CommonRangePickerComponent,
        ShiftManagementComponent,
    ],
    templateUrl: './attendance.component.html'
})
export class AttendanceComponent implements OnInit, OnDestroy {
    protected store = inject(AttendanceStore);
    protected auth = inject(AuthService);
    view = signal<'logs' | 'shifts' | 'all-logs'>('logs');

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

    viewTitle = computed(() => {
        switch (this.view()) {
            case 'logs': return 'My Attendance';
            case 'all-logs': return 'Employee Attendance';
            case 'shifts': return 'Shift Management';
            default: return 'Attendance';
        }
    });

    viewSubtitle = computed(() => {
        switch (this.view()) {
            case 'logs': return 'Track your check-ins and work hours';
            case 'all-logs': return 'Monitor company-wide attendance logs';
            case 'shifts': return 'Configure and assign employee shifts';
            default: return 'Manage workforce presence effectively';
        }
    });

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Present', value: 'present' },
        { label: 'Late', value: 'late' },
        { label: 'Absent', value: 'absent' },
        { label: 'Half Day', value: 'half-day' }
    ];

    currentTime = new Date();
    private timer: any;

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
        // Automatically reload logs when switching views or filters change
        effect(() => {
            // Register dependencies
            const currentView = this.view();
            this.search();
            this.status();
            this.dateRange();

            // When filters change, always load from page 1
            const filters = untracked(() => this.getFilters(1));

            if (currentView === 'logs') {
                this.store.loadLogs(filters);
            } else if (currentView === 'all-logs') {
                this.store.loadAdminLogs(filters);
            }
        });
    }

    // ─── Table columns matching backend response fields ──────────────────────
    // Backend returns: attendanceDate, checkIn, checkOut, totalHours, status
    // Relations: employee.user.email, shift.name
    columns: Column[] = [
        { field: 'employee.user.email', header: 'Employee' },
        { field: 'shift.name', header: 'Shift' },
        { field: 'attendanceDate', header: 'Date', type: 'date' },
        { field: 'checkIn', header: 'Check In', type: 'time' },
        { field: 'checkOut', header: 'Check Out', type: 'time' },
        { field: 'totalHours', header: 'Hours', type: 'duration' },
        { field: 'status', header: 'Status', type: 'status' }
    ];

    ngOnInit() {
        this.timer = setInterval(() => {
            this.currentTime = new Date();
        }, 1000);
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    onLazyLoad(event: any) {
        const page = (event.first / event.rows) + 1;
        const limit = event.rows;

        // Skip duplicate call if already loading or if page/limit already match
        if (this.store.loading() || (this.store.page() === page && this.store.limit() === limit && this.store.logs().length > 0)) {
            return;
        }

        const filters = {
            ...this.getFilters(),
            page,
            limit
        };

        if (this.view() === 'logs') {
            this.store.loadLogs(filters);
        } else if (this.view() === 'all-logs') {
            this.store.loadAdminLogs(filters);
        }
    }

    // Flow 2: Check-in — sends { shiftId?, workLocationId?, note? }
    onCheckIn() {
        this.store.checkIn();
    }

    // Flow 3: Check-out — sends only { note? }
    onCheckOut() {
        this.store.checkOut();
    }

    get canCheckIn(): boolean {
        return !this.store.todayStatus()?.checkIn;
    }

    get canCheckOut(): boolean {
        const today = this.store.todayStatus();
        return !!(today?.checkIn && !today?.checkOut);
    }

    get todayHours(): string {
        const log = this.store.todayStatus();
        const raw = log?.totalHours;
        if (!raw) return '—';
        const num = Number(raw);
        if (isNaN(num) || num === 0) return '0h 0m';
        // If > 1000, treat as milliseconds; otherwise treat as decimal hours
        const totalMinutes = num > 1000
            ? Math.floor(num / 1000 / 60)
            : Math.floor(num * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m}m`;
    }
}
