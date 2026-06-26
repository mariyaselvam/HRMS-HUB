import { Component, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeamStore } from '../../store/team.store';
import { DepartmentStore } from '../../store/department.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { Team } from '../../core/models/team.model';
import { NotificationService } from '../../core/services/notification.service';
import { ContextStore } from '../../store/context.store';

@Component({
    selector: 'app-team-list',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CardModule,
        DialogModule,
        FormsModule,
        ReactiveFormsModule,
        CommonInputComponent,
        CommonSelectComponent
    ],
    templateUrl: './team-list.component.html'
})
export class TeamListComponent {
    protected store = inject(TeamStore);
    protected deptStore = inject(DepartmentStore);
    protected contextStore = inject(ContextStore);
    private fb = inject(FormBuilder);
    private notify = inject(NotificationService);

    showDialog = false;
    isEdit = false;
    selectedTeamId: string | null = null;
    submitted = false;

    columns: Column[] = [
        { field: 'name', header: 'Team Name' },
        { field: 'department.name', header: 'Department' },
        { field: 'workLocation.name', header: 'Branch' },
        { field: '_count.employees', header: 'Members' },
        { field: 'createdAt', header: 'Created At', type: 'date' }
    ];

    form = this.fb.group({
        name: ['', [Validators.required]],
        departmentId: ['', [Validators.required]]
    });

    deptOptions = computed(() =>
        this.deptStore.departments().map(d => ({ label: d.name, value: d.id }))
    );

    constructor() {
        effect(() => {
            const branchId = this.contextStore.activeBranchId();
            this.store.loadTeams(branchId || undefined);
            this.deptStore.loadDepartments(branchId || undefined);
        });
    }

    openAddDialog() {
        const activeBranch = this.contextStore.activeBranchId();
        if (!activeBranch) {
            this.notify.warn('Select a Branch', 'Please select a specific branch from the header dropdown to create a team.');
            return;
        }
        this.isEdit = false;
        this.selectedTeamId = null;
        this.form.reset();
        this.submitted = false;
        this.showDialog = true;
    }

    onEdit(team: Team) {
        this.isEdit = true;
        this.selectedTeamId = team.id;
        this.form.patchValue({
            name: team.name,
            departmentId: team.departmentId
        });
        this.submitted = false;
        this.showDialog = true;
    }

    onDelete(team: Team) {
        this.notify.confirmDelete(team.name, () => {
            this.store.deleteTeam(team.id);
        });
    }

    onSubmit() {
        this.submitted = true;
        if (this.form.valid) {
            const activeBranch = this.contextStore.activeBranchId();
            if (!activeBranch) {
                this.notify.error('Specific Branch Required', 'Please select a specific branch from the header dropdown.');
                return;
            }
            const val = {
                name: this.form.value.name as string,
                departmentId: this.form.value.departmentId as string,
                workLocationId: activeBranch
            };
            if (this.isEdit && this.selectedTeamId) {
                this.store.updateTeam(this.selectedTeamId, val);
            } else {
                this.store.addTeam(val);
            }
            this.showDialog = false;
        }
    }

    getErrorMessage(controlName: string): string | null {
        if (!this.submitted) return null;
        const control = this.form.get(controlName);
        if (control?.errors?.['required']) {
            if (controlName === 'name') return 'Team name is required';
            if (controlName === 'departmentId') return 'Department is required';
        }
        return null;
    }
}
