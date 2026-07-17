import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { EmployeeStore } from '../../store/employee.store';
import { DepartmentStore } from '../../store/department.store';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonDatePickerComponent } from '../../shared/components/datepicker/common-date-picker/common-date-picker.component';
import { LocationStore } from '../../store/location.store';
import { TeamStore } from '../../store/team.store';
import {
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  EMP_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  TAX_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  PT_STATE_OPTIONS,
} from './onboarding.constants';

import { SalaryConfigService } from '../../core/services/salary-config.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepperModule,
    ButtonModule,
    CardModule,
    CommonInputComponent,
    CommonSelectComponent,
    CommonDatePickerComponent,
  ],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(EmployeeStore);
  protected deptStore = inject(DepartmentStore);
  protected locationStore = inject(LocationStore);
  protected teamStore = inject(TeamStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private salaryConfig = inject(SalaryConfigService);

  activeStep = signal(1);
  employeeId = signal<string | null>(null);
  salaryTemplateOptions = signal<{ label: string; value: string }[]>([]);
  breakdownItems = signal<any[]>([]);
  netSalary = signal<number>(0);
  componentsList = signal<any[]>([]);

  // Document Upload State
  uploadedFiles = signal<{ file: File; type: string; previewUrl?: string }[]>([]);

  onStepChange(step: number | undefined) {
    if (step !== undefined) {
      this.activeStep.set(step);
    }
  }

  // Forms
  step1Form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    employeeCode: ['', [Validators.required]],
    departmentId: [null, [Validators.required]],
    teamId: [null, [Validators.required]],
    workLocationId: [null, [Validators.required]],
    dateOfJoining: [new Date(), [Validators.required]],
    role: ['employee', [Validators.required]],
    status: ['probation', [Validators.required]],
    managerId: [null],
  });

  step2Form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    gender: ['Male'],
    dob: [null],
    maritalStatus: ['Single'],
    currentAddress: [''],
    permAddress: [''],
  });

  step3Form: FormGroup = this.fb.group({
    designation: [''],
    employmentType: ['Full-time'],
    workLocationType: ['Office'],
    probationPeriod: [6],
    noticePeriod: [90],
    salaryTemplateId: [null],
  });

  step4Form: FormGroup = this.fb.group({
    accountNumber: ['', [Validators.pattern(/^\d{9,18}$/)]],
    ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
    bankName: [''],
    branchName: [''],
  });

  step5Form: FormGroup = this.fb.group({
    ctc: [0, [Validators.required, Validators.min(0)]],
    basicSalary: [0, [Validators.required, Validators.min(0)]],
    hra: [0, [Validators.min(0)]],
    transportAllowance: [0, [Validators.min(0)]],
    otherAllowances: [0, [Validators.min(0)]],
    effectiveFrom: [new Date(), [Validators.required]],
    pan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
    uan: [''],
    esiNumber: [''],
    pfApplicable: [false],
    esiApplicable: [false],
    ptState: ['TN'],
    taxRegime: ['new'],
  });

  // Options
  deptOptions = computed(() =>
    this.deptStore.departments().map((d) => ({ label: d.name, value: d.id })),
  );

  locationOptions = computed(() =>
    this.locationStore.locations().map((l) => ({ label: l.name, value: l.id })),
  );

  teamOptions = computed(() => this.teamStore.teams().map((t) => ({ label: t.name, value: t.id })));

  genderOptions = GENDER_OPTIONS;
  maritalOptions = MARITAL_OPTIONS;
  empTypeOptions = EMP_TYPE_OPTIONS;
  workModeOptions = WORK_MODE_OPTIONS;
  taxOptions = TAX_OPTIONS;
  roleOptions = ROLE_OPTIONS;
  statusOptions = STATUS_OPTIONS;
  ptStateOptions = PT_STATE_OPTIONS;

  employeeOptions = computed(() =>
    this.store.employees().map((e) => ({ label: e.email, value: e.id })),
  );

  ngOnInit() {
    this.deptStore.loadDepartments();
    this.locationStore.loadLocations();
    this.teamStore.loadTeams();
    this.store.loadEmployees();

    this.salaryConfig.getTemplates().subscribe((templates) => {
      this.salaryTemplateOptions.set(
        templates.map((t) => ({ label: t.name, value: t.id! }))
      );
    });

    this.salaryConfig.getComponents().subscribe((comps) => {
      this.componentsList.set(comps);
    });

    // Watch CTC to auto-calculate breakdown dynamically
    this.step5Form.get('ctc')?.valueChanges.subscribe((ctc) => {
      if (ctc > 0) {
        const monthlyCTC = Math.round(ctc / 12);
        const templateId = this.step3Form.get('salaryTemplateId')?.value;
        if (templateId) {
          this.salaryConfig.calculatePreview(templateId, monthlyCTC).subscribe({
            next: (res) => {
              this.breakdownItems.set(res.breakdown);
              this.netSalary.set(res.netSalary);
              // Patch legacy form fields for fallback compatibility
              const basic = res.breakdown.find(i => i.code === 'BASIC')?.value || 0;
              const hra = res.breakdown.find(i => i.code === 'HRA')?.value || 0;
              const transport = res.breakdown.find(i => i.code === 'TRANSPORT')?.value || 0;
              const special = res.breakdown.find(i => i.code === 'SPECIAL' || i.code === 'OTHER')?.value || 0;

              this.step5Form.patchValue({
                basicSalary: basic,
                hra: hra,
                transportAllowance: transport,
                otherAllowances: special,
              }, { emitEvent: false });
            }
          });
        } else {
          // Fallback default calculation if no template selected
          const basic = Math.round((ctc * 0.5) / 12);
          const hra = Math.round(basic * 0.4);
          const other = Math.round(monthlyCTC - basic - hra);
          this.breakdownItems.set([
            { code: 'BASIC', name: 'Basic Salary', type: 'earning', value: basic },
            { code: 'HRA', name: 'House Rent Allowance', type: 'earning', value: hra },
            { code: 'SPECIAL', name: 'Special Allowance', type: 'earning', value: other }
          ]);
          this.netSalary.set(monthlyCTC);

          this.step5Form.patchValue({
            basicSalary: basic,
            hra: hra,
            transportAllowance: 0,
            otherAllowances: other,
          }, { emitEvent: false });
        }
      }
    });

    // Check if resuming from ID
    this.route.params.subscribe((params) => {
      if (params['id']) {
        const id = params['id'];
        this.employeeId.set(id);
        this.fetchEmployeeData(id);
      }
    });
  }

  fetchEmployeeData(id: string) {
    this.store.getEmployee(id).subscribe((emp) => {
      // 1. Pre-fill Step 1 (Core)
      this.step1Form.patchValue({
        email: emp.email,
        employeeCode: emp.employeeCode,
        departmentId: emp.departmentId,
        teamId: emp.teamId,
        workLocationId: emp.workLocationId,
        dateOfJoining: emp.dateOfJoining ? new Date(emp.dateOfJoining) : new Date(),
        role: emp.role || 'employee',
        status: emp.employmentStatus || 'probation',
        managerId: emp.managerId || null,
      });

      // 2. Pre-fill Step 2 (Personal)
      if (emp.personalDetails) {
        this.step2Form.patchValue({
          ...emp.personalDetails,
          dob: emp.personalDetails.dob ? new Date(emp.personalDetails.dob) : null,
        });
      }

      // 3. Pre-fill Step 3 (Job)
      if (emp.jobDetails) {
        this.step3Form.patchValue({
          ...emp.jobDetails,
          salaryTemplateId: emp.salaryTemplateId || null,
        });
      }

      // 4. Pre-fill Step 4 (Bank)
      if (emp.bankDetails) {
        this.step4Form.patchValue(emp.bankDetails);
      }

      // 5. Pre-fill Step 5 (Compensation & Statutory)
      if (emp.statutoryDetails) {
        this.step5Form.patchValue({
          pan: emp.statutoryDetails.pan,
          uan: emp.statutoryDetails.uan,
          esiNumber: emp.statutoryDetails.esiNumber,
          pfApplicable: emp.statutoryDetails.pfApplicable,
          esiApplicable: emp.statutoryDetails.esiApplicable,
          ptState: emp.statutoryDetails.ptState,
          taxRegime: emp.statutoryDetails.taxRegime,
        });
      }

      // Load most recent salary structure
      this.store.loadSalaryStructure(id).subscribe((salary) => {
        if (salary) {
          this.step5Form.patchValue({
            effectiveFrom: new Date(salary.effectiveFrom),
            ctc: Number(salary.grossSalary) * 12,
          });
          if (salary.items && salary.items.length > 0) {
            this.breakdownItems.set(salary.items.map((i: any) => ({
              code: i.component.code,
              name: i.component.name,
              type: i.component.type,
              value: Number(i.amount)
            })));
            this.netSalary.set(Number(salary.netSalary));
          }
        }
      });

      // 6. Jump to correct step
      this.activeStep.set(emp.onboardingStep || 1);
    });
  }

  getErrorMessage(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);
    if (control && control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Required';
      if (control.errors?.['email']) return 'Invalid email';
      if (control.errors?.['pattern']) return 'Invalid format';
      if (control.errors?.['minlength'])
        return `Min ${control.errors['minlength'].requiredLength} chars`;
      if (control.errors?.['min']) return `Value must be at least ${control.errors['min'].min}`;
    }
    return null;
  }

  handleStep1(nextCallback: any) {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.store.onboardEmployee(this.step1Form.value).subscribe({
      next: (newEmp) => {
        this.employeeId.set(newEmp.id);
        this.activeStep.set(2);
        if (typeof nextCallback === 'function') nextCallback();
      },
      error: () => {},
    });
  }

  handleStep2(nextCallback: any) {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }
    this.store.savePersonalDetails(this.employeeId()!, this.step2Form.value).subscribe({
      next: () => {
        this.activeStep.set(3);
        if (typeof nextCallback === 'function') nextCallback();
      },
    });
  }

  handleStep3(nextCallback: any) {
    if (this.step3Form.invalid) {
      this.step3Form.markAllAsTouched();
      return;
    }
    this.store.saveJobDetails(this.employeeId()!, this.step3Form.value).subscribe({
      next: () => {
        this.activeStep.set(4);
        if (typeof nextCallback === 'function') nextCallback();
      },
    });
  }

  handleStep4(nextCallback: any) {
    if (this.step4Form.invalid) {
      this.step4Form.markAllAsTouched();
      return;
    }
    this.store.saveBankDetails(this.employeeId()!, this.step4Form.value).subscribe({
      next: () => {
        this.activeStep.set(5);
        if (typeof nextCallback === 'function') nextCallback();
      },
    });
  }
  handleStep5(nextCallback: any) {
    if (this.step5Form.invalid) {
      this.step5Form.markAllAsTouched();
      return;
    }

    const val = this.step5Form.value;

    const comps = this.componentsList();
    const items = this.breakdownItems().map(b => {
      const component = comps.find(c => c.code === b.code);
      return {
        salaryComponentId: component?.id || '',
        amount: b.value
      };
    }).filter(i => i.salaryComponentId !== '');

    this.store
      .saveStatutoryDetails(this.employeeId()!, {
        pan: val.pan,
        uan: val.uan,
        esiNumber: val.esiNumber,
        pfApplicable: val.pfApplicable,
        esiApplicable: val.esiApplicable,
        ptState: val.ptState,
        taxRegime: val.taxRegime,
      })
      .subscribe({
        next: () => {
          this.store
            .setupSalary({
              employeeId: this.employeeId()!,
              grossSalary: val.ctc / 12,
              effectiveFrom: val.effectiveFrom,
              items: items
            })
            .subscribe({
              next: () => {
                this.activeStep.set(6);
                if (typeof nextCallback === 'function') nextCallback();
              },
            });
        },
      });
  }
  getEarnings() {
    return this.breakdownItems().filter(i => i.type === 'earning');
  }

  getDeductions() {
    return this.breakdownItems().filter(i => i.type === 'deduction');
  }

  // --- Step 6: Documents ---
  onFileSelect(event: Event, type: string) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      this.uploadedFiles.update((files) => {
        const filtered = files.filter((f) => f.type !== type);
        return [...filtered, { file, type, previewUrl }];
      });
    }
  }

  getFileForType(type: string) {
    return this.uploadedFiles().find((f) => f.type === type);
  }

  removeFile(type: string) {
    this.uploadedFiles.update((files) => {
      const target = files.find((f) => f.type === type);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return files.filter((f) => f.type !== type);
    });
  }

  handleStep6() {
    if (this.uploadedFiles().length > 0) {
      const formData = new FormData();
      this.uploadedFiles().forEach((f) => {
        formData.append('documents', f.file, f.file.name);
        formData.append('documentTypes', f.type);
      });
      this.store.saveDocuments(this.employeeId()!, formData).subscribe({
        next: () => {
          this.store.finalizeOnboarding(this.employeeId()!).subscribe({
            next: () => this.router.navigate(['/employees']),
          });
        },
      });
    } else {
      this.store.finalizeOnboarding(this.employeeId()!).subscribe({
        next: () => this.router.navigate(['/employees']),
      });
    }
  }

  fillDummyData() {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const firstNames = [
      'Arun',
      'Priya',
      'Sanjay',
      'Deepika',
      'Karthik',
      'Anjali',
      'Vikram',
      'Meera',
    ];
    const lastNames = ['Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Nair', 'Verma', 'Iyer'];
    const cities = ['Chennai', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi'];

    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    if (this.activeStep() === 1) {
      this.step1Form.patchValue({
        email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${randomId}@hrms.com`,
        password: 'Password123!',
        employeeCode: `EMP-${randomId}`,
        departmentId:
          this.deptOptions()[Math.floor(Math.random() * this.deptOptions().length)]?.value,
        teamId: this.teamOptions()[Math.floor(Math.random() * this.teamOptions().length)]?.value,
        workLocationId:
          this.locationOptions()[Math.floor(Math.random() * this.locationOptions().length)]?.value,
        dateOfJoining: new Date(),
        role: ROLE_OPTIONS[Math.floor(Math.random() * ROLE_OPTIONS.length)].value,
        status: STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)].value,
        managerId: this.employeeOptions().length > 0 ? this.employeeOptions()[0].value : null,
      });
    } else if (this.activeStep() === 2) {
      this.step2Form.patchValue({
        firstName: randomFirstName,
        lastName: randomLastName,
        mobile: '9' + Math.floor(100000000 + Math.random() * 900000000).toString(),
        gender: GENDER_OPTIONS[Math.floor(Math.random() * GENDER_OPTIONS.length)].value,
        dob: new Date(
          1990 + Math.floor(Math.random() * 15),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28),
        ),
        maritalStatus: MARITAL_OPTIONS[Math.floor(Math.random() * MARITAL_OPTIONS.length)].value,
        currentAddress: `${randomId}, MG Road, ${randomCity}`,
        permAddress: `Same as above`,
      });
    } else if (this.activeStep() === 3) {
      const designations = [
        'Senior Software Engineer',
        'Product Manager',
        'HR Specialist',
        'UI/UX Designer',
        'Accountant',
      ];
      this.step3Form.patchValue({
        designation: designations[Math.floor(Math.random() * designations.length)],
        employmentType: EMP_TYPE_OPTIONS[Math.floor(Math.random() * EMP_TYPE_OPTIONS.length)].value,
        workLocationType:
          WORK_MODE_OPTIONS[Math.floor(Math.random() * WORK_MODE_OPTIONS.length)].value,
        probationPeriod: 6,
        noticePeriod: 90,
      });
    } else if (this.activeStep() === 4) {
      const banks = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI'];
      this.step4Form.patchValue({
        accountNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        ifscCode: 'BANK000' + Math.floor(1000 + Math.random() * 9000).toString(),
        bankName: banks[Math.floor(Math.random() * banks.length)],
        branchName: randomCity + ' Main Branch',
      });
    } else if (this.activeStep() === 5) {
      const ctc = (Math.floor(Math.random() * 10) + 5) * 100000;
      this.step5Form.patchValue({
        ctc: ctc,
        basicSalary: Math.round((ctc * 0.4) / 12),
        hra: Math.round((ctc * 0.2) / 12),
        transportAllowance: 2000,
        otherAllowances: Math.round((ctc * 0.4) / 12) - 2000,
        effectiveFrom: new Date(),
        pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000).toString() + 'F',
        uan: '100' + Math.floor(100000000 + Math.random() * 900000000).toString(),
        esiNumber: '31' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        pfApplicable: true,
        esiApplicable: false,
        ptState: PT_STATE_OPTIONS[Math.floor(Math.random() * PT_STATE_OPTIONS.length)].value,
        taxRegime: TAX_OPTIONS[Math.floor(Math.random() * TAX_OPTIONS.length)].value,
      });
    } else if (this.activeStep() === 6) {
      // Magic fill for Step 6: Fake a File Upload
      const dummyContent = 'This is a dummy document for development testing purposes.';
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const mockFile = new File([blob], `dummy_id_proof_${randomId}.txt`, { type: 'text/plain' });

      this.uploadedFiles.update((files) => [
        ...files.filter((f) => f.type !== 'id_proof'),
        { file: mockFile, type: 'id_proof' },
      ]);
    }
  }
}
