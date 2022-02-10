import { Component, OnInit } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  public user: any;
  public pageSize: number = 10;
  public startIndex: number = 0;
  public orderHistory: Array<any> = [];
  public pendingPaymentOrders: Array<any> = [];
  public loadMoreLoading: boolean = false;
  public loadMoreButton: string = 'Older orders';
  constructor(private newgenService: NewgenApiService) {}

  ngOnInit(): void {
    this.getOrderHistory(this.pageSize, this.startIndex);
    // this.getPendingPaymentOrders();
  }

  getOrderHistory(pageSize: number, startIndex: number) {
    this.newgenService
      .getOrderHistory(
        'false',
        pageSize,
        startIndex,
        '{"and":[{"ne":["payStatus","1"]}]}'
      )
      .subscribe(x => {
        this.orderHistory = x.collection;
      });
  }

  getPendingPaymentOrders() {
    this.newgenService
      .getOrderHistory('false', 100, 0, '{"and":[{"eq":["payStatus","1"]}]}')
      .subscribe(x => {
        console.log(x);
        this.pendingPaymentOrders = x.collection;
      });
  }

  loadMore() {
    this.startIndex += 10;
    this.loadMoreLoading = true;
    this.newgenService
      .getOrderHistory(
        'false',
        this.pageSize,
        this.startIndex,
        '{"and":[{"ne":["payStatus","1"]}]}'
      )
      .subscribe(x => {
        if (x.collection.length == 0) {
          this.loadMoreButton = 'No more orders can be found';
          return;
        }
        if (x.collection.length < 10) {
          this.orderHistory = [...this.orderHistory, ...x.collection];
          this.loadMoreButton = 'No more orders can be found';
          this.loadMoreLoading = true;
        } else {
          this.orderHistory = [...this.orderHistory, ...x.collection];
          this.loadMoreLoading = false;
        }
      });
  }

  getCartPendingPayment(id: string) {
    this.newgenService.cartPendingPaymentGet(id).subscribe(x => {
      this.pendingPaymentOrders = x.collection;
    });
  }

  pay(cartId: number) {
    window.open(
      'https://demo.justpruvit.com/#/checkout?cart_id=' + cartId,
      '_blank'
    );
  }

  goToTracking(url: string) {
    window.open(url, '_blank');
  }
}
