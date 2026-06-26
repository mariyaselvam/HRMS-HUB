import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeStore } from '../../store/employee.store';
import { Employee } from '../../core/models/employee.model';
import { CardModule } from 'primeng/card';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

@Component({
    selector: 'app-employee-detail',
    standalone: true,
    imports: [CommonModule, CardModule, CommonButtonComponent, Tabs, TabList, Tab, TabPanels, TabPanel],
    templateUrl: './employee-detail.component.html'
})
export class EmployeeDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    protected store = inject(EmployeeStore);

    employee = this.store.selectedEmployee;
    loading = this.store.loading;

    private router = inject(Router);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.store.loadEmployeeById(id);
        }
    }

    getInitials(name: string): string {
        if (!name) return 'EE';
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    }

    getDisplayName(): string {
        const emp = this.employee();
        if (emp?.personalDetails?.firstName) {
            return `${emp.personalDetails.firstName} ${emp.personalDetails.lastName || ''}`;
        }
        return emp?.employeeCode || 'Employee';
    }

    goBack() {
        this.router.navigate(['/employees']);
    }

    onEdit() {
        const emp = this.employee();
        if (emp) {
            this.router.navigate(['/employees/onboard', emp.id], { queryParams: { step: 6 } });
        }
    }

    onFileUpload(event: any) {
        const file = event.target.files[0];
        if (file && this.employee()?.id) {
            const formData = new FormData();
            formData.append('documents', file);
            formData.append('documentTypes', 'other');
            this.store.saveDocuments(this.employee()!.id, formData);
        }
    }

    getDocumentIcon(type: string): string {
        switch (type?.toLowerCase()) {
            case 'resume': return 'pi-file-pdf';
            case 'id_proof': return 'pi-id-card';
            case 'offer_letter': return 'pi-envelope';
            default: return 'pi-file';
        }
    }

    formatBytes(bytes: number): string {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
