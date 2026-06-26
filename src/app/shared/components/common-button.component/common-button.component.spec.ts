import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonButtonComponent } from './common-button.component';
import { By } from '@angular/platform-browser';

describe('CommonButtonComponent', () => {
    let component: CommonButtonComponent;
    let fixture: ComponentFixture<CommonButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonButtonComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CommonButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show spinner when loading and hide icon/label if necessary (template dependency)', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();
        
        const spinner = fixture.debugElement.query(By.css('.pi-spin'));
        expect(spinner).toBeTruthy();
    });

    it('should show label when provided', () => {
        fixture.componentRef.setInput('label', 'Click Me');
        fixture.detectChanges();
        
        const span = fixture.debugElement.query(By.css('span'));
        expect(span.nativeElement.textContent).toContain('Click Me');
    });

    it('should apply correct classes based on inputs', () => {
        fixture.componentRef.setInput('variant', 'danger');
        fixture.componentRef.setInput('size', 'lg');
        fixture.detectChanges();
        
        const button = fixture.debugElement.query(By.css('button'));
        expect(button.nativeElement.classList.contains('btn-danger')).toBe(true);
        expect(button.nativeElement.classList.contains('btn-lg')).toBe(true);
    });

    it('should be disabled when loading is true', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();
        
        const button = fixture.debugElement.query(By.css('button'));
        expect(button.nativeElement.disabled).toBe(true);
    });

    it('should emit onClick event when clicked', () => {
        const spy = vi.fn();
        component.onClick.subscribe(spy);
        
        const button = fixture.debugElement.query(By.css('button'));
        button.triggerEventHandler('click', new MouseEvent('click'));
        
        expect(spy).toHaveBeenCalled();
    });
});
