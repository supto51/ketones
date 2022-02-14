import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
declare var bannerSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-banner-slider',
  templateUrl: './banner-slider.component.html',
  styleUrls: ['./banner-slider.component.css'],
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  featureProducts: any[] = [];
  isReferrerPresent = false;
  referrer: any = {};
  refCode = '';
  defaultLanguage = '';
  subscriptions: SubscriptionLike[] = [];
  isStaging: boolean;
  isSubDomain = false;

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private productsDataService: ProductsDataService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.getBaseUrlStatus();
  }

  getBaseUrlStatus() {
    this.subscriptions.push(
      this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
        this.isSubDomain = status;
      })
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
                    this.isReferrerPresent = true;
                    console.log(this.referrer);
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
            this.refCode = referrer.code;
            this.referrer = referrer;
            this.isReferrerPresent = true;
          }
        })
      );
    }
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            const products = productsData.list.filter(
              (item: any) => item.mvp_custom_users !== 'on'
            );
            this.getFeatureProducts(products);
          }
        }
      )
    );
  }

  getTranslatedText() {
    let translatedText = '';
    switch (this.selectedLanguage) {
      case 'en':
        translatedText = 'How it works';
        break;
      case 'de':
        translatedText = 'Wie es funktioniert';
        break;
      case 'es':
        translatedText = 'Cómo funciona';
        break;
      case 'it':
        translatedText = 'Come funziona';
        break;
      case 'zh-hans':
        translatedText = '运作机制';
        break;
      case 'zh-hant':
        translatedText = '運作機制';
        break;
      default:
        translatedText = 'How it works';
        break;
    }
    return translatedText;
  }

  getFeatureProducts(products: any[]) {
    const tempFeatureProducts: any[] = [];
    if (products) {
      products.forEach((product: any) => {
        const prevDate = new Date(
          product.mvp_slider_start_date + ' ' + product.mvp_slider_start_time
        );
        const nextDate = new Date(
          product.mvp_slider_end_date + ' ' + product.mvp_slider_end_time
        );
        const today = new Date();
        if (today > prevDate && today < nextDate) {
          tempFeatureProducts.push(product);
        }
      });
    }
    this.featureProducts = tempFeatureProducts;
    this.loadBannerSlider(this.featureProducts.length);
  }

  loadBannerSlider(productsLength: number) {
    if (productsLength === 1) {
      bannerSliderJS(false);
    }
    if (productsLength > 1) {
      const bannerSlick = $(
        '.sk-main__banner-slider.slick-initialized.slick-slider.slick-dotted'
      );

      if (bannerSlick.length > 0) {
        $('.sk-main__banner-slider').slick('unslick');
      }
      setTimeout(() => {
        bannerSliderJS(true);
      });
    }
  }

  getWistiaVideoID(videoLink: string) {
    let videoID = '';
    if (videoLink) {
      if (videoLink.includes('home.wistia.com')) {
        videoID = videoLink.substring(videoLink.lastIndexOf('/') + 1);
      } else {
        videoID = videoLink;
      }
    }
    return videoID;
  }

  isPruvitTVPresent(videoLink: string) {
    if (videoLink) {
      if (videoLink.includes('pruvit.tv')) {
        return true;
      }
    }
    return false;
  }

  onClickPruvitTvVideo(videoLink: string) {
    this.dataService.setPruvitTvLink(videoLink);
    this.productsDataService.changePostName('pruvit-modal-utilities');
    $('#pruvitTVModal').modal('show');
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);
    this.productsDataService.changePostName(postName);
  }

  getBackgroundColor(bgImage?: string, rgb1?: string, rgb2?: string) {
    if (bgImage !== '') {
      return 'url(' + bgImage + ')';
    } else if (rgb1 !== '' && rgb2 !== '') {
      return `linear-gradient(45deg, ${rgb1}, ${rgb2})`;
    } else {
      return '';
    }
  }

  onClickProductImage(postName: string) {
    if (postName) {
      const routeURL = '/product/' + postName;
      this.utilityService.navigateToRoute(
        routeURL,
        this.selectedCountry,
        this.selectedLanguage,
        this.isStaging,
        this.refCode,
        this.defaultLanguage
      );
    }
  }

  onClickReferrerName() {
    this.dataService.changeModals([{ modalName: 'independentPruver' }]);
  }

  isEuropeCountryShown() {
    if (
      this.selectedCountry === 'AT' ||
      this.selectedCountry === 'BE' ||
      this.selectedCountry === 'FI' ||
      this.selectedCountry === 'FR' ||
      this.selectedCountry === 'DE' ||
      this.selectedCountry === 'HU' ||
      this.selectedCountry === 'IE' ||
      this.selectedCountry === 'IT' ||
      this.selectedCountry === 'NL' ||
      this.selectedCountry === 'PL' ||
      this.selectedCountry === 'PT' ||
      this.selectedCountry === 'ES' ||
      this.selectedCountry === 'SE' ||
      this.selectedCountry === 'CH' ||
      this.selectedCountry === 'RO'
    ) {
      return true;
    } else {
      return false;
    }
  }

  onClickCreateAccount() {
    let langCode = '';

    if (this.selectedLanguage === 'es') langCode = 'es-mx';
    else if (this.selectedLanguage === 'pt-pt') langCode = 'pt';
    else langCode = this.selectedLanguage;

    const newAccountLink = `http://cloud.justpruvit.com/#/register/${this.refCode}?country=${this.selectedCountry}&language=${langCode}`;

    window.location.href = newAccountLink;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
