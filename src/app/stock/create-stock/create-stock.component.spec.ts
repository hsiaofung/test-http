import {
  async,
  fakeAsync,
  tick,
  ComponentFixture,
  TestBed,
  inject,
} from "@angular/core/testing";
import { CreateStockComponent } from "./create-stock.component";
import { StockService } from "../../services/stock.service";
import { Stock } from "../../model/stock";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { By } from "@angular/platform-browser";
import { StockItemComponent } from "../stock-item/stock-item.component";

describe("CreateStockComponent With Real Service", () => {
  let component: CreateStockComponent;
  let fixture: ComponentFixture<CreateStockComponent>;
  let httpBackend: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateStockComponent, StockItemComponent],
      providers: [StockService],
      imports: [FormsModule, HttpClientModule, HttpClientTestingModule],
    }).compileComponents();
  }));

  beforeEach(inject(
    [HttpTestingController],
    (backend: HttpTestingController) => {
      httpBackend = backend;
      fixture = TestBed.createComponent(CreateStockComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }
  ));

  it("should make call to create stock and handle failure", async(() => {
    expect(component).toBeTruthy();
    fixture.detectChanges();

    component.stock = {
      name: "Test Stock",
      price: 200,
      previousPrice: 500,
      code: "TSS",
      exchange: "NYSE",
      favorite: false,
    };

    component.createStock({ valid: true });

    let httpReq = httpBackend.expectOne(
      //預期測試過程中對/api/stock發出一個POST請求
      {
        url: "/api/stock",
        method: "POST",
      },
      "Create Stock with Failure"
    );

    expect(httpReq.request.body).toEqual(component.stock); // 確保POST請求的內容與元件中建構的股票相同

    httpReq.flush(
      { msg: "Stock already exists." }, // 定義POST請求的回應為400失敗
      { status: 400, statusText: "Failed!!" }
    );

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const messageEl = fixture.debugElement.query(By.css(".message"))
        .nativeElement;
      expect(messageEl.textContent).toEqual("Stock already exists."); // 檢查伺服器回應正確的被元件顯示
    });
  }));

  afterEach(() => {
    httpBackend.verify(); // 確保POST請求在測試中發生
  });
});
