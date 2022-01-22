import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ProductsDataService {
  private productsData = new BehaviorSubject(false);
  currentProductsData = this.productsData.asObservable();

  private postName: Subject<string> = new Subject();
  currentPostName = this.postName.asObservable();

  constructor() {}

  setProductsData(data: any) {
    this.productsData.next(data);
  }

  changePostName(name: string) {
    this.postName.next(name);
  }
}
