import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationsList } from './invitations-list';

describe('InvitationsList', () => {
  let component: InvitationsList;
  let fixture: ComponentFixture<InvitationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
