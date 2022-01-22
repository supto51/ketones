import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class SidebarDataService {
  private sidebarName: Subject<string> = new Subject();
  currentSidebarName = this.sidebarName.asObservable();

  private cartData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  currentCartData = this.cartData.asObservable();

  private cartSkus = new BehaviorSubject('');
  currentCartSkus = this.cartSkus.asObservable();

  private cartStatus: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);
  currentCartStatus = this.cartStatus.asObservable();

  private countries = new BehaviorSubject(false);
  currentCountries = this.countries.asObservable();

  private promoterCartData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    []
  );
  currentPromoterCartData = this.promoterCartData.asObservable();

  private shortenedLink = new BehaviorSubject('');
  currentShortenedLinkLink = this.shortenedLink.asObservable();

  private cartOrCheckoutModal = new BehaviorSubject('');
  currentCartOrCheckoutModal = this.cartOrCheckoutModal.asObservable();

  private languagesData = new BehaviorSubject(false);
  currentLanguagesData = this.languagesData.asObservable();

  constructor() {}

  changeSidebarName(message: string) {
    this.sidebarName.next(message);
  }

  setCartData(data: any[]) {
    this.cartData.next(data);
  }

  changeCartSkus(data: any) {
    this.cartSkus.next(data);
  }

  changeCartStatus(data: boolean) {
    this.cartStatus.next(data);
  }

  setCountries(data: any) {
    this.countries.next(data);
  }

  setPromoterCartData(data: any[]) {
    this.promoterCartData.next(data);
  }

  setShortenedUrlLink(link: string) {
    this.shortenedLink.next(link);
  }

  changeCartOrCheckoutModal(name: string) {
    this.cartOrCheckoutModal.next(name);
  }

  setLanguagesData(data: any) {
    this.languagesData.next(data);
  }
}
