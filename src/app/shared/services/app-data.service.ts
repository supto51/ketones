import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppDataService {
  searchKey: string = '';

  private selectedlanguage = new BehaviorSubject('en');
  currentSelectedLanguage = this.selectedlanguage.asObservable();

  private referrerData = new BehaviorSubject(false);
  currentReferrerData = this.referrerData.asObservable();

  private selectedCountry = new BehaviorSubject('');
  currentSelectedCountry = this.selectedCountry.asObservable();

  private modals: Subject<any[]> = new Subject();
  currentModals = this.modals.asObservable();

  private redirectURL = new BehaviorSubject('');
  currentRedirectURL = this.redirectURL.asObservable();

  private bodyHasClass: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);
  currentBodyHasClass = this.bodyHasClass.asObservable();

  private discountHeight = new BehaviorSubject(0);
  currentDiscountHeight = this.discountHeight.asObservable();

  private pruvitTvLink = new BehaviorSubject('');
  currentPruvitTvLink = this.pruvitTvLink.asObservable();

  private isFromSmartship = new BehaviorSubject(false);
  currentIsFromSmartship = this.isFromSmartship.asObservable();

  private isDeepLinkPresent: BehaviorSubject<boolean | null> =
    new BehaviorSubject<boolean | null>(null);
  currentDeepLinkPresent = this.isDeepLinkPresent.asObservable();

  private pageSlug = new BehaviorSubject({});
  currentPageSlug = this.pageSlug.asObservable();

  private isCheckout = new BehaviorSubject(false);
  currentIsCheckout = this.isCheckout.asObservable();

  private isSubdomain = new BehaviorSubject(false);
  currentIsSubdomain = this.isSubdomain.asObservable();

  private offerArray: BehaviorSubject<{ offer: any[]; index: number }> =
    new BehaviorSubject<{ offer: any[]; index: number }>({
      offer: [],
      index: 0,
    });
  currentOfferArray = this.offerArray.asObservable();

  private isOfferFlow = new BehaviorSubject(false);
  currentOfferFlowStatus = this.isOfferFlow.asObservable();

  private blogsData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  currentBlogsData = this.blogsData.asObservable();

  promoterData: BehaviorSubject<
    { country: string; language: string; sku: any; price: number }[]
  > = new BehaviorSubject<
    { country: string; language: string; sku: any; price: number }[]
  >([]);
  currentPromoterData = this.promoterData.asObservable();

  private pulseProProduct = new BehaviorSubject({});
  currentPulseProProduct = this.pulseProProduct.asObservable();

  private isCheckoutFromFood = new BehaviorSubject(false);
  currentIsCheckoutFromFood = this.isCheckoutFromFood.asObservable();

  constructor() {}

  changeSelectedLanguage(data: any) {
    this.selectedlanguage.next(data);
  }

  setReferrer(data: any) {
    this.referrerData.next(data);
  }

  changeSelectedCountry(data: any) {
    this.selectedCountry.next(data);
  }

  changeModals(data: any) {
    this.modals.next(data);
  }

  changeRedirectURL(name: string) {
    this.redirectURL.next(name);
  }

  changeBodyClassStatus(status: boolean) {
    this.bodyHasClass.next(status);
  }

  changeDiscountHeight(height: number) {
    this.discountHeight.next(height);
  }

  setPruvitTvLink(link: string) {
    this.pruvitTvLink.next(link);
  }

  setIsFromSmartshipStatus(status: boolean) {
    this.isFromSmartship.next(status);
  }

  changeDeepLinkStatus(status: boolean) {
    this.isDeepLinkPresent.next(status);
  }

  setPageSlug(data: { url?: string; elementId?: number }) {
    this.pageSlug.next(data);
  }

  setIsCheckoutStatus(status: boolean) {
    this.isCheckout.next(status);
  }

  setIsSubdomainStatus(status: boolean) {
    this.isSubdomain.next(status);
  }

  setOfferArray(offerArray: any[], offerIndex: number) {
    this.offerArray.next({ offer: offerArray, index: offerIndex });
  }

  setOfferFlowStatus(status: boolean) {
    this.isOfferFlow.next(status);
  }

  setBlogsData(data: any[]) {
    this.blogsData.next(data);
  }

  setPromoterData(
    data: { country: string; language: string; sku: any; price: number }[]
  ) {
    this.promoterData.next(data);
  }

  setPulseProProduct(data: any) {
    this.pulseProProduct.next(data);
  }

  setIsCheckoutFromFoodStatus(status: boolean) {
    this.isCheckoutFromFood.next(status);
  }

  set searchData(data: string) {
    this.searchKey = data;
  }

  get searchData() {
    return this.searchKey;
  }
}
