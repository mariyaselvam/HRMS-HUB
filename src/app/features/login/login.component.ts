import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, MessageModule, CommonInputComponent, CommonButtonComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    email = '';
    password = '';
    loading = false;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please enter both email and password.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const credentials: LoginRequest = {
            email: this.email,
            password: this.password
        };

        this.authService.login(credentials).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage =
                    err?.error?.message || 'Invalid email or password. Please try again.';
            }
        });
    }
}
