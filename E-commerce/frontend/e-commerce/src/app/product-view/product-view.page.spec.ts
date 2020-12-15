import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductViewPage } from './product-view.page';

describe('ProductViewPage', () => {
  let component: ProductViewPage;
  let fixture: ComponentFixture<ProductViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
