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
import { ClusterStore } from './store/cluster.store';
import { ContextStore } from './store/context.store';
import { computed } from '@angular/core';

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
    clusterStore = inject(ClusterStore);
    contextStore = inject(ContextStore);
    
    sidebarVisible = signal(false);
    isMobileOpen = signal(false);
    isDesktopCollapsed = signal(false);

    hierarchicalBranchOptions = computed(() => {
        const clusters = this.clusterStore.clusters();
        const locations = this.locationStore.locations();
        
        const groups: Array<{ label: string; items: Array<{ label: string; value: string }> }> = [];

        // Group branches by Cluster
        for (const cl of clusters) {
            const clusterBranches = locations.filter(l => l.clusterId === cl.id);
            if (clusterBranches.length > 0) {
                groups.push({
                    label: `🌐 ${cl.name} ${cl.state ? '(' + cl.state + ')' : ''}`,
                    items: clusterBranches.map(b => ({
                        label: `📍 ${b.name}`,
                        value: b.id
                    }))
                });
            }
        }

        // Standalone branches (no cluster)
        const standaloneBranches = locations.filter(l => !l.clusterId);
        if (standaloneBranches.length > 0) {
            groups.push({
                label: '🏢 Standalone Branches',
                items: standaloneBranches.map(b => ({
                    label: `📍 ${b.name}`,
                    value: b.id
                }))
            });
        }

        return groups;
    });

    constructor() {
        if (this.authService.isLoggedIn() && (this.authService.hasRole('company_admin') || this.authService.hasRole('Cluster Manager') || this.authService.hasRole('Super Admin'))) {
            this.locationStore.loadLocations();
            this.clusterStore.loadClusters();
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
