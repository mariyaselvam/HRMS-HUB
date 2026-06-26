import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationStore } from '../../store/location.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { WorkLocation } from '../../core/models/location.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-location-list',
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
    templateUrl: './location-list.component.html'
})
export class LocationListComponent implements OnInit {
    protected store = inject(LocationStore);
    private fb = inject(FormBuilder);
    private notify = inject(NotificationService);

    showDialog = false;
    submitted = false;
    editingLocation: WorkLocation | null = null;

    columns: Column[] = [
        { field: 'name', header: 'Branch Name' },
        { field: 'address', header: 'Address' },
        { field: '_count.employees', header: 'Employees' },
        { field: 'createdAt', header: 'Created At', type: 'date' }
    ];

    form = this.fb.group({
        name: ['', [Validators.required]],
        address: [''],
        latitude: [null],
        longitude: [null]
    });

    ngOnInit() {
        this.store.loadLocations();
    }

    get dialogTitle(): string {
        return this.editingLocation ? 'Edit Branch' : 'Add Branch';
    }

    openAddDialog() {
        this.editingLocation = null;
        this.form.reset();
        this.submitted = false;
        this.showDialog = true;
    }

    onEdit(location: WorkLocation) {
        this.editingLocation = location;
        this.form.patchValue({
            name: location.name,
            address: location.address,
            latitude: location.latitude as any,
            longitude: location.longitude as any
        });
        this.submitted = false;
        this.showDialog = true;
    }

    onDelete(location: WorkLocation) {
        this.notify.confirmDelete(location.name, () => {
            // this.store.deleteLocation(location.id); // Placeholder
            this.notify.warn('Feature coming soon', 'Deletion is not yet implemented for branches.');
        });
    }

    onSave() {
        this.submitted = true;
        if (this.form.valid) {
            const val = this.form.value;
            const payload = {
                ...val,
                latitude: val.latitude ? Number(val.latitude) : null,
                longitude: val.longitude ? Number(val.longitude) : null
            };
            this.store.addLocation(payload as any);
            this.showDialog = false;
        }
    }

    getErrorMessage(controlName: string): string | null {
        if (!this.submitted) return null;
        const control = this.form.get(controlName);
        if (control?.errors?.['required']) return 'Branch name is required';
        return null;
    }
}
