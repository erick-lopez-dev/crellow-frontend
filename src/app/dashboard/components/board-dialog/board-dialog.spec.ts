import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardDialog } from './board-dialog';

describe('BoardDialog', () => {
  let component: BoardDialog;
  let fixture: ComponentFixture<BoardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
