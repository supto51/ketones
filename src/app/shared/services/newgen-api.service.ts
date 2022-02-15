import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewgenApiService {
  newgenPath: string;

  constructor(private http: HttpClient) {
    this.newgenPath = environment.newgenUrl;
  }
  getPersonal(): Observable<any> {
    return this.http.get<any>(this.newgenPath + '/report/personal');
  }

  getOrderHistory(
    nocount: string,
    pageSize: number,
    startIndex: number,
    filter?: string
  ): Observable<any> {
    return this.http.get<any>(
      this.newgenPath +
        '/report/OrderHistory?filter=' +
        filter +
        '&noCount=' +
        nocount +
        '&pageSize=' +
        pageSize +
        '&startIndex=' +
        startIndex +
        '&sort=dateCreated+desc'
    );
  }

  cartPendingPaymentGet(userId: string): Observable<any> {
    return this.http.get<any>(
      this.newgenPath + '/commerce/cart-pending-payment',
      { params: { userId: userId } }
    );
  }
}
