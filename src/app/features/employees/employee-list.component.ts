import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeStore } from '../../store/employee.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { ButtonModule } from 'primeng/button';
import { Employee } from '../../core/models/employee.model';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { ContextStore } from '../../store/context.store';

@Component({
    selector: 'app-employee-list',
    standalone: true,
    imports: [
        CommonModule, 
        CommonTableComponent, 
        CommonButtonComponent, 
        CardModule,
        FormsModule,
        PopoverModule,
        CommonInputComponent,
        CommonSelectComponent,
        ButtonModule
    ],
    templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent {
    protected store = inject(EmployeeStore);
    private notify = inject(NotificationService);
    private router = inject(Router);
    protected contextStore = inject(ContextStore);

    constructor() {
        effect(() => {
            const branchId = this.contextStore.activeBranchId();
            this.store.loadEmployees(branchId || undefined);
        });
    }



    columns: Column[] = [
        { field: 'employeeCode', header: 'Employee Code' },
        { field: 'email', header: 'Email' },
        { field: 'department', header: 'Department' },
        { field: 'team', header: 'Team' },
        { field: 'dateOfJoining', header: 'Joining Date', type: 'date' },
        { field: 'profileCompletion', header: 'Progress', type: 'progress' },
        { field: 'employmentStatus', header: 'Status', type: 'status' }
    ];

    // Filters
    searchQuery = signal<string>('');
    selectedDepartment = signal<string | null>(null);
    selectedStatus = signal<string | null>(null);

    activeFilterCount = computed(() => {
        let count = 0;
        if (this.searchQuery()) count++;
        if (this.selectedDepartment()) count++;
        if (this.selectedStatus()) count++;
        return count;
    });

    // Filter Options
    departments = computed(() => {
        const deps = this.store.employees().map(e => e.department).filter(d => !!d);
        return [...new Set(deps)].map(d => ({ label: d, value: d }));
    });

    statuses = computed(() => {
        const stats = this.store.employees().map(e => e.employmentStatus).filter(s => !!s);
        return [...new Set(stats)].map(s => ({ label: s, value: s }));
    });

    // Filtered Data
    filteredEmployees = computed(() => {
        let data = this.store.employees();
        
        const q = this.searchQuery().toLowerCase();
        if (q) {
            data = data.filter(e => 
                (e.employeeCode && e.employeeCode.toLowerCase().includes(q)) ||
                (e.email && e.email.toLowerCase().includes(q))
            );
        }

        const dept = this.selectedDepartment();
        if (dept) {
            data = data.filter(e => e.department === dept);
        }

        const status = this.selectedStatus();
        if (status) {
            data = data.filter(e => e.employmentStatus === status);
        }

        return data;
    });

    clearFilters() {
        this.searchQuery.set('');
        this.selectedDepartment.set(null);
        this.selectedStatus.set(null);
    }

    openAddDialog(): void {
        this.router.navigate(['/employees/onboard']);
    }

    onView(employee: Employee): void {
        this.router.navigate(['/employees', employee.id]);
    }

    onEdit(employee: Employee): void {
        this.router.navigate(['/employees/onboard', employee.id]);
    }

    onDelete(employee: Employee): void {
        this.notify.confirmDelete(employee.employeeCode, () => {
            this.store.deleteEmployee(employee.id);
        });
    }
}
