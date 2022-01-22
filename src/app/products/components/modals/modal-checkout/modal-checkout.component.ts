import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  HostListener,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ProductsDataService } from '../../../services/products-data.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { FoodCart } from 'src/app/foods/models/food-cart.model';
import * as cryptojs from 'crypto-js';
declare var $: any;

@Component({
  selector: 'app-modal-checkout',
  templateUrl: './modal-checkout.component.html',
  styleUrls: ['./modal-checkout.component.css'],
})
export class ModalCheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('input', { static: false }) input!: ElementRef;
  @Input() modals!: any[];
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  refCode = '';
  isReferrerPresent = true;
  referrer: any = {};
  currentOffer = 0;
  isSubmittable = false;
  checkoutLink = '';
  productSkus = '';
  checkoutURL = '';
  redirectURL = '';
  gaCode = '';
  fbCode = '';
  currencySymbol = '$';
  referrerRedirectModal = '';
  defaultLanguage = '';
  isStaging: boolean;
  checkoutFullLink = '';
  googleConversionId = '';
  googleConversionLabel = '';
  referrerVideoId = '';
  isCheckoutFromFood = false;
  foodCheckoutURL = '';
  sha256Salt = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private router: Router,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private sidebarDataService: SidebarDataService
  ) {
    this.checkoutURL = environment.checkoutURL;
    this.redirectURL = environment.redirectURL;
    this.isStaging = environment.isStaging;
    this.foodCheckoutURL = environment.foodCheckoutUrl;
    this.sha256Salt = environment.shaSalt;

    $(document).on('shown.bs.modal', '#referrerCode', () => {
      if (this.input) {
        this.input.nativeElement.focus();
      }
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getReferrer();
    this.getModals();
    this.getProductSkus();
    this.getCartOrCheckoutModal();
    this.checkIsCheckoutFromFood();
  }

  checkIsCheckoutFromFood() {
    this.subscriptions.push(
      this.dataService.currentIsCheckoutFromFood.subscribe((status) => {
        this.isCheckoutFromFood = status;
      })
    );
  }

  getCartOrCheckoutModal() {
    this.sidebarDataService.currentCartOrCheckoutModal.subscribe(
      (name: string) => {
        if (name !== '') {
          this.referrerRedirectModal = name;
        }
      }
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getProducts();
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
      })
    );
  }

  getProductSkus() {
    this.subscriptions.push(
      this.sidebarDataService.currentCartSkus.subscribe((skus: string) => {
        this.productSkus = skus;
      })
    );
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;
            this.getCurrencySymbol();
            this.getCheckoutFullLink();
          }
        }
      )
    );
  }

  getCheckoutFullLink() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;

      this.checkoutFullLink = productsSettings.checkout_url;
    }
  }

  getCurrencySymbol() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';
    }
  }

  getReferrer() {
    if (this.isStaging) {
      this.subscriptions.push(
        this.route.queryParamMap.subscribe((params) => {
          const refCode = params.get('ref');
          if (refCode !== null) {
            this.refCode = refCode;
            this.subscriptions.push(
              this.dataService.currentReferrerData.subscribe(
                (referrer: any) => {
                  if (referrer) {
                    this.referrer = referrer;
                    this.refCode = referrer.code;
                    this.gaCode = referrer.ga_track_id
                      ? referrer.ga_track_id
                      : '';
                    this.fbCode = referrer.fb_pixel_id
                      ? referrer.fb_pixel_id
                      : '';
                    this.googleConversionId = referrer.ga_ad_track_id
                      ? referrer.ga_ad_track_id
                      : '';
                    this.googleConversionLabel = referrer.ga_ad_conv_lbl
                      ? referrer.ga_ad_conv_lbl
                      : '';
                    this.referrerVideoId = referrer.video_id
                      ? referrer.video_id
                      : '';
                  }
                }
              )
            );
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            this.referrer = referrer;
            this.refCode = referrer.code;
            this.gaCode = referrer.ga_track_id ? referrer.ga_track_id : '';
            this.fbCode = referrer.fb_pixel_id ? referrer.fb_pixel_id : '';
            this.googleConversionId = referrer.ga_ad_track_id
              ? referrer.ga_ad_track_id
              : '';
            this.googleConversionLabel = referrer.ga_ad_conv_lbl
              ? referrer.ga_ad_conv_lbl
              : '';
            this.referrerVideoId = referrer.video_id ? referrer.video_id : '';
          }
        })
      );
    }
  }

  getModals() {
    if (this.modals.length === 1) {
      this.modals.forEach((singleModal: any) => {
        if (singleModal.modalName === 'referrerCode') {
          $('#referrerCode').modal('show');
        }
        if (singleModal.modalName === 'referrerBy') {
          $('#referrerBy').modal('show');
        }
        if (singleModal.modalName === 'independentPruver') {
          $('#independentPruver').modal('show');
        }
      });
      this.modals = [];
    }
  }

  getExchangedPrice(price: number) {
    let finalPrice = 0;

    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      const exchangedPrice =
        productsSettings.exchange_rate !== ''
          ? +productsSettings.exchange_rate * price
          : price;

      finalPrice =
        productsSettings.tax_rate !== '' && +productsSettings.tax_rate !== 0
          ? exchangedPrice + (exchangedPrice * +productsSettings.tax_rate) / 100
          : exchangedPrice;
    }
    return finalPrice;
  }

  getNumFormat(num: number) {
    if (isNaN(num)) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      return num.toFixed(2);
    }
  }

  /* --------- referrer modal section ------------- */
  onSubmit() {
    let redirectRoute: string = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;
    this.isSubmittable = true;

    if (this.selectedCountry !== 'US') {
      redirectRoute = redirectRoute.replace(
        '/' + this.selectedCountry.toLowerCase(),
        ' '
      );
    }
    redirectRoute = redirectRoute.trim();

    if (this.refCode !== '') {
      this.subscriptions.push(
        this.apiService.getReferrer(this.refCode).subscribe((referrer: any) => {
          if (referrer.length === 0) {
            this.isReferrerPresent = false;
          } else {
            if (this.referrerRedirectModal === 'checkout') {
              this.isReferrerPresent = true;
              this.dataService.setReferrer(referrer);
              $('#referrerCode').modal('hide');
              $('#referrerBy').modal('show');
              this.utilityService.navigateToRoute(
                redirectRoute,
                this.selectedCountry,
                this.selectedLanguage,
                this.isStaging,
                this.refCode,
                this.defaultLanguage
              );
            }
            if (this.referrerRedirectModal === 'shareCart') {
              this.isReferrerPresent = true;
              this.dataService.setReferrer(referrer);
              $('#referrerCode').modal('hide');
              this.utilityService.navigateToRoute(
                redirectRoute,
                this.selectedCountry,
                this.selectedLanguage,
                this.isStaging,
                this.refCode,
                this.defaultLanguage
              );
              this.productsDataService.changePostName('pruvit-modal-utilities');
              $('#shareCartModal').modal('show');
            }
          }
          this.isSubmittable = false;
        })
      );
    }
  }

  onClickReferrer() {
    if (this.isCheckoutFromFood) {
      let foodSkus = '';

      const LocalCheckoutFoods = localStorage.getItem('CheckoutFoods');
      let CheckoutFoods: FoodCart[] = LocalCheckoutFoods
        ? JSON.parse(LocalCheckoutFoods)
        : null;
      if (!CheckoutFoods) {
        CheckoutFoods = [];
      }

      CheckoutFoods.forEach((food: FoodCart, index: any) => {
        foodSkus += food.food.sku + '-ONCE' + ':' + food.food.quantity;
        if (CheckoutFoods.length - 1 !== index) {
          foodSkus += ',';
        }
      });

      this.checkoutLink =
        this.foodCheckoutURL +
        this.refCode +
        '?products=' +
        foodSkus +
        '&country=' +
        this.selectedCountry.toLowerCase() +
        '&catalog=sunbasket' +
        '&redirect_url=' +
        this.redirectURL +
        '&language=' +
        this.selectedLanguage +
        '&gaCode=' +
        this.gaCode +
        '&fbCode=' +
        this.fbCode +
        '&googleConversionId=' +
        this.googleConversionId +
        '&googleConversionLabel=' +
        this.googleConversionLabel +
        '&promptLogin=false';

      const hash = cryptojs
        .SHA256(this.checkoutLink + this.sha256Salt)
        .toString(cryptojs.enc.Hex)
        .toUpperCase();

      this.checkoutLink += '&hash=' + hash;
    } else {
      if (this.checkoutFullLink !== '') {
        let tempLink = this.checkoutFullLink.replace(
          '{invite_id}',
          this.refCode
        );
        tempLink = tempLink.replace('{product_skus}', this.productSkus);
        tempLink = tempLink.replace(
          '{country}',
          this.selectedCountry.toLowerCase()
        );
        tempLink = tempLink.replace('{language}', this.selectedLanguage);
        tempLink =
          tempLink + '&gaCode=' + this.gaCode + '&fbCode=' + this.fbCode;

        if (this.googleConversionId !== '') {
          tempLink =
            tempLink + '&googleConversionId=' + this.googleConversionId;
        }
        if (this.googleConversionLabel !== '') {
          tempLink =
            tempLink + '&googleConversionLabel=' + this.googleConversionLabel;
        }
        this.checkoutLink = tempLink;
      } else {
        this.checkoutLink =
          this.checkoutURL +
          this.refCode +
          '?products=' +
          this.productSkus +
          '&country=' +
          this.selectedCountry.toLowerCase() +
          '&redirect_url=' +
          this.redirectURL +
          '&language=' +
          this.selectedLanguage +
          '&gaCode=' +
          this.gaCode +
          '&fbCode=' +
          this.fbCode +
          '&googleConversionId=' +
          this.googleConversionId +
          '&googleConversionLabel=' +
          this.googleConversionLabel;
      }
    }

    const height = 760;
    const width = 500;
    const leftPosition = window.innerWidth / 2 - width / 2;
    const topPosition =
      window.innerHeight / 2 -
      height / 2 +
      (window.outerHeight - window.innerHeight);

    window.open(
      this.checkoutLink,
      'checkoutWindowRef',
      'status=no,height=' +
        height +
        ',width=' +
        width +
        ',resizable=yes,left=' +
        leftPosition +
        ',top=' +
        topPosition +
        ',screenX=' +
        leftPosition +
        ',screenY=' +
        topPosition +
        ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no'
    );
  }

  onClickNotReferrer() {
    $('#referrerBy').modal('hide');
    $('#referrerCode').modal('show');
  }

  getContactText(text: string) {
    return text.replace('{email}', '');
  }

  @HostListener('window:beforeunload', ['$event'])
  showMessage(event: any) {
    if ($('#checkout__widget').hasClass('show')) {
      event.returnValue = 'Checkout Widget Shown';
    }
  }

  onClickCloseCheckoutWidget() {
    this.utilityService.confirmWithCloseCheckoutWidget();
  }

  hasImageUrl(referrer: any) {
    return referrer.hasOwnProperty('imageUrl');
  }

  getContactFormUrl() {
    let contactFormLink = '';

    if (this.selectedLanguage === 'en') {
      contactFormLink =
        'https://support.justpruvit.com/hc/en-us/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'de') {
      contactFormLink =
        'https://support.justpruvit.com/hc/de/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'es-es') {
      contactFormLink =
        'https://support.justpruvit.com/hc/es-es/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'es') {
      contactFormLink =
        'https://support.justpruvit.com/hc/es-mx/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'it') {
      contactFormLink =
        'https://support.justpruvit.com/hc/it/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'pt-pt') {
      contactFormLink =
        'https://support.justpruvit.com/hc/pt/requests/new?ticket_form_id=360001589991';
    } else if (
      this.selectedLanguage === 'zh-hans' ||
      this.selectedLanguage === 'zh-hant'
    ) {
      contactFormLink =
        'https://support.justpruvit.com/hc/zh-tw/requests/new?ticket_form_id=360001589991';
    } else {
      contactFormLink =
        'https://support.justpruvit.com/hc/en-us/requests/new?ticket_form_id=360001589991';
    }

    return contactFormLink;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
