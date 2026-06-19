import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { LocationStore } from './store/location.store';
import { ContextStore } from './store/context.store';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        ButtonModule,
        InputTextModule,
        ToastModule,
        ConfirmDialogModule,
        SelectModule,
        FormsModule,
        SidebarComponent
    ],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    title = 'hrms-fe';
    authService = inject(AuthService);
    themeService = inject(ThemeService);
    locationStore = inject(LocationStore);
    contextStore = inject(ContextStore);
    
    sidebarVisible = signal(false); // Used across the app previously, let's keep it for mobile open state or rename.
    isMobileOpen = signal(false);
    isDesktopCollapsed = signal(false);

    constructor() {
        if (this.authService.isLoggedIn() && this.authService.hasRole('company_admin')) {
            this.locationStore.loadLocations();
        }
    }

    toggleSidebar(): void {
        if (window.innerWidth < 768) {
            this.isMobileOpen.update(v => !v);
        } else {
            this.isDesktopCollapsed.update(v => !v);
        }
    }

    onLogout(): void {
        this.authService.logout();
    }
}
