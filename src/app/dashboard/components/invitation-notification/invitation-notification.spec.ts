import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationNotification } from './invitation-notification';

describe('InvitationNotification', () => {
  let component: InvitationNotification;
  let fixture: ComponentFixture<InvitationNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
