import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentStore } from '../../store/department.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { Department } from '../../core/models/department.model';
import { NotificationService } from '../../core/services/notification.service';
import { ContextStore } from '../../store/context.store';

@Component({
    selector: 'app-department-list',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CardModule,
        DialogModule,
        FormsModule,
        ReactiveFormsModule,
        CommonInputComponent
    ],
    templateUrl: './department-list.component.html'
})
export class DepartmentListComponent {
    protected store = inject(DepartmentStore);
    protected contextStore = inject(ContextStore);
    private fb = inject(FormBuilder);
    private notify = inject(NotificationService);

    showDialog = false;
    submitted = false;
    editingDepartment: Department | null = null;

    columns: Column[] = [
        { field: 'name', header: 'Department Name' },
        { field: 'workLocation.name', header: 'Branch' },
        { field: 'createdAt', header: 'Created At', type: 'date' }
    ];

    form = this.fb.group({
        name: ['', [Validators.required]]
    });

    constructor() {
        effect(() => {
            const branchId = this.contextStore.activeBranchId();
            this.store.loadDepartments(branchId || undefined);
        });
    }

    get dialogTitle(): string {
        return this.editingDepartment ? 'Edit Department' : 'Add Department';
    }

    openAddDialog() {
        const activeBranch = this.contextStore.activeBranchId();
        if (!activeBranch) {
            this.notify.warn('Select a Branch', 'Please select a specific branch from the header dropdown to create a department.');
            return;
        }
        this.editingDepartment = null;
        this.form.reset();
        this.submitted = false;
        this.showDialog = true;
    }

    onEdit(department: Department) {
        this.editingDepartment = department;
        this.form.patchValue({
            name: department.name
        });
        this.submitted = false;
        this.showDialog = true;
    }

    onDelete(department: Department) {
        this.notify.confirmDelete(department.name, () => {
            this.store.deleteDepartment(department.id);
        });
    }

    onSave() {
        this.submitted = true;
        if (this.form.valid) {
            const activeBranch = this.contextStore.activeBranchId();
            if (!activeBranch) {
                this.notify.error('Specific Branch Required', 'Please select a specific branch from the header dropdown.');
                return;
            }
            const payload = {
                name: this.form.value.name as string,
                workLocationId: activeBranch
            };
            if (this.editingDepartment) {
                this.store.updateDepartment(this.editingDepartment.id, payload);
            } else {
                this.store.addDepartment(payload);
            }
            this.showDialog = false;
        }
    }

    getErrorMessage(controlName: string): string | null {
        if (!this.submitted) return null;
        const control = this.form.get(controlName);
        if (control?.errors?.['required']) {
            if (controlName === 'name') return 'Department name is required';
        }
        return null;
    }
}
