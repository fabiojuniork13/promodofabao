import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountDialogComponent } from './discount-dialog.component';

describe('DiscountDialogComponent', () => {
  let component: DiscountDialogComponent;
  let fixture: ComponentFixture<DiscountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
