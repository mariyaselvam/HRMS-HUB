import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses"
      (click)="onClick.emit($event)">
      @if (loading()) {
        <i class="pi pi-spinner pi-spin"></i>
      } @else if (icon()) {
        <i [class]="icon()"></i>
      }
      @if (label()) {
        <span>{{ label() }}</span>
      }
    </button>
  `,
    styleUrl: './common-button.component.css'
})
export class CommonButtonComponent {
    label = input<string>('');
    icon = input<string>('');
    type = input<'button' | 'submit' | 'reset'>('button');
    variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
    size = input<'sm' | 'md' | 'lg'>('md');
    disabled = input<boolean>(false);
    loading = input<boolean>(false);
    fullWidth = input<boolean>(false);

    onClick = output<MouseEvent>();

    get buttonClasses(): string {
        const base = 'btn';
        const v = `btn-${this.variant()}`;
        const s = `btn-${this.size()}`;
        const w = this.fullWidth() ? 'btn-full' : '';
        return `${base} ${v} ${s} ${w}`.trim();
    }
}
