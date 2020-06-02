import {
  async,
  fakeAsync,
  tick,
  ComponentFixture,
  TestBed,
  inject,
} from "@angular/core/testing";
import { StockListComponent } from "./stock-list.component";
import { StockService } from "../../services/stock.service";
import { Stock } from "../../model/stock";
import { HttpClientModule } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { By } from "@angular/platform-browser";
import { StockItemComponent } from "../stock-item/stock-item.component";

describe("StockListComponent With Real Service", () => {
  let component: StockListComponent;
  let fixture: ComponentFixture<StockListComponent>;
  let httpBackend: HttpTestingController; // 引入HttpTestingController 區域變數

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StockListComponent, StockItemComponent],
      providers: [StockService],
      imports: [HttpClientModule, HttpClientTestingModule], // 匯入HttpClientModule與HttpTestingController
    }).compileComponents();
  }));

  beforeEach(inject(
    [HttpTestingController],
    (backend: HttpTestingController) => {
      httpBackend = backend;
      fixture = TestBed.createComponent(StockListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      httpBackend
        .expectOne(
          // 設定/api/stock呼叫作為測試的一部份。
          {
            url: "/api/stock",
            method: "GET",
          },
          "Get list of stocks"
        )
        .flush([
          // 定義呼叫GET時回傳的股票清單
          {
            name: "Test Stock 1",
            code: "TS1,",
            price: 80,
            previousPrice: 90,
            exchange: "NYSE",
          },
          {
            name: "Test Stock 2",
            code: "TS2",
            price: 800,
            previousPrice: 900,
            exchange: "NYSE",
          },
        ]);
    }
  ));
  it("should load stocks from real service on init", async(() => {
    expect(component).toBeTruthy();
    expect(component.stocks$).toBeTruthy();

    fixture.whenStable().then(() => {
      // 等待Angular工作序列清空然後繼續
      fixture.detectChanges();
      const stockItems = fixture.debugElement.queryAll(
        By.css("app-stock-item")
      );
      expect(stockItems.length).toEqual(2);
    });
  }));

  afterEach(() => {
    httpBackend.verify(); // 檢驗/api/stock的GET呼叫確實是測試的一部份
  });
});
