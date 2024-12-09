import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationMenuComponent } from './consultation-menu.component';

describe('ConsultationMenuComponent', () => {
  let component: ConsultationMenuComponent;
  let fixture: ComponentFixture<ConsultationMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultationMenuComponent]
    });
    fixture = TestBed.createComponent(ConsultationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
