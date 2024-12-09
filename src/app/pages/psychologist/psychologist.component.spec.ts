import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsychologistComponent } from './psychologist.component';

describe('PsychologistComponent', () => {
  let component: PsychologistComponent;
  let fixture: ComponentFixture<PsychologistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsychologistComponent],
    });
    fixture = TestBed.createComponent(PsychologistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export { PsychologistComponent };
