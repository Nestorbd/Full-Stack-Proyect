import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UpdateUserPage } from './update-user.page';

describe('UpdateUserPage', () => {
  let component: UpdateUserPage;
  let fixture: ComponentFixture<UpdateUserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
