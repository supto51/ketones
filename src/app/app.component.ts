import {
  Component,
  OnInit,
  ViewChild,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  ChangeDetectorRef,
  HostListener,
  Renderer2,
  Inject,
  PLATFORM_ID,
  PlatformRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalProductsComponent } from './products/components/modals/modal-products/modal-products.component';
import { ModalCheckoutComponent } from './products/components/modals/modal-checkout/modal-checkout.component';
import { FacebookService, InitParams } from 'ngx-facebook';
import { TranslateService } from '@ngx-translate/core';
import { ModalUtilitiesComponent } from './products/components/modals/modal-utilities/modal-utilities.component';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from './products/services/products-data.service';
import { ProductsUtilityService } from './products/services/products-utility.service';
import { SidebarDataService } from './sidebar/services/sidebar-data.service';
import { AppUtilityService } from './shared/services/app-utility.service';
import { AppDataService } from './shared/services/app-data.service';
import { AppApiService } from './shared/services/app-api.service';
import { ProductsApiService } from './products/services/products-api.service';
import { SidebarApiService } from './sidebar/services/sidebar-api.service';
import { initializePhraseAppEditor } from 'ngx-translate-phraseapp';
import { AppSeoService } from './shared/services/app-seo.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ModalFoodsComponent } from './foods/modals/modal-foods/modal-foods.component';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import { map } from 'rxjs/operators';
import { FoodApiService } from './foods/services/food-api.service';
import { FoodDelivery } from './foods/models/food-delivery.model';
import { ModalPurchaseWarningComponent } from './shared/components/modal-purchase-warning/modal-purchase-warning.component';
import { ModalZipComponent } from './foods/modals/modal-zip/modal-zip.component';
declare var $: any;

const config = {
  projectId: 'dec2efdab93d62d55da009cb683a438a',
  phraseEnabled: true,
  prefix: '[[__',
  suffix: '__]]',
  fullReparse: true,
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('modalcontainer', { read: ViewContainerRef })
  modalcontainer!: ViewContainerRef;
  sidebarName = '';
  selectedLanguage = '';
  selectedCountry = '';
  modalComponentRef!: ComponentRef<any>;
  isLoaded = false;
  isCodePresent = false;
  langCode = '';
  oneTimeCart: any[] = [];
  everyMonthCart: any[] = [];
  fbPageID = '';
  showCookies = false;
  appLoaded = false;
  production: boolean;
  isStaging: boolean;
  clientDomain = '';
  generalSettings: any = {};
  productsWithLanguages: any = {};
  defaultLanguage = '';
  refCode = '';
  translationsList: any[] = [];
  referrerVideoId = '';
  isCookieForCountry = false;
  isCookiePresent = -1;
  currentModalId = '';
  isRootRoute = false;
  isBrowser: boolean;

  constructor(
    private apiService: AppApiService,
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private resolver: ComponentFactoryResolver,
    private changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private utilityService: AppUtilityService,
    private fb: FacebookService,
    private renderer: Renderer2,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private productsUtilityService: ProductsUtilityService,
    private sidebarDataService: SidebarDataService,
    private productsApiService: ProductsApiService,
    private sidebarApiService: SidebarApiService,
    private seoService: AppSeoService,
    private foodApiService: FoodApiService,
    private store: Store<AppState>,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: PlatformRef
  ) {
    this.production = environment.production;
    this.isStaging = environment.isStaging;
    this.clientDomain = environment.clientDomainURL;
    this.appLoaded = true;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.setSeo();
    if (this.isBrowser) {
      this.setLangCode();
      this.setCountry();
      this.getRefCode();
      this.setPhraseEditor();
      this.setPromoter();
    }
  }

  ngOnInit() {
    this.setTheme();
    this.setCountries();
    this.getQueryParams();
    this.getSidebarName();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.createCurrentProductModal();
    this.createCurrentCheckoutModal();
    this.createCurrentFoodModal();
    this.loginMVUser();
    this.clearCartData();
    this.setTranslationsList();
  }

  setSeo() {
    this.seoService.updateTitle('');
    this.seoService.updateDescription('');
    this.seoService.updateDocumentLanguageAndCountry();
    this.seoService.updateRobotsForCountry();
    this.seoService.updateMeta(
      'keywords',
      'pruvit, pruvit ketones, prüvit, nat ketones, pruvit login, ketones drink, pruvit keto, prüvit, pruvitnow, pruvit canada, pruvit australia, ketones pruvit, keto nat, keto kreme, nat ketones drink, keto os, pruvit 10 day challenge, drink ketones challenge, pruvit.com, keto reboot, pruvit singapore, shopketo, shopketo australia, shopketo canada, shopketo singapore, shop keto, shopketo au, shopketo ca, shopketo sg, shopketo.com, shop keto.com, shop keto pruvit, shop ketones'
    );
  }

  setPromoter() {
    const LocalPromoter = localStorage.getItem('Promoter');
    const promoterData = LocalPromoter ? JSON.parse(LocalPromoter) : null;

    if (promoterData !== null) {
      this.dataService.setPromoterData(promoterData);
    }
  }

  setTranslationsList() {
    this.apiService.getPhraseLanguages().subscribe((languages: any[]) => {
      this.translationsList = languages;
    });
  }

  setPhraseEditor() {
    const translateMode: any =
      this.utilityService.getUrlParameter('phrase_context');

    if (translateMode !== false) {
      initializePhraseAppEditor(config);
    }
  }

  setLangCode() {
    const langCode: any = this.utilityService.getUrlParameter('lang');
    this.langCode = !langCode ? '' : langCode;
  }

  setTheme() {
    if (this.isBrowser) {
      if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.renderer.addClass(document.body, 'dark-theme');
          this.renderer.removeClass(document.body, 'body-gray');
        } else {
          this.renderer.removeClass(document.body, 'dark-theme');
        }
      }
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          const newColorScheme = e.matches ? 'dark' : 'light';

          if (newColorScheme === 'dark') {
            this.renderer.addClass(document.body, 'dark-theme');
            this.renderer.removeClass(document.body, 'body-gray');
          } else {
            this.renderer.removeClass(document.body, 'dark-theme');
          }
        });
    }
  }

  clearCartData() {
    const LocalCartTime = localStorage.getItem('CartTime');
    const cartStorageValue = LocalCartTime ? JSON.parse(LocalCartTime) : null;

    if (cartStorageValue !== null) {
      const currentTime = new Date().getTime();

      const timeDifference = (currentTime - cartStorageValue) / 1000;

      if (timeDifference >= 12 * 60 * 60) {
        localStorage.setItem('OneTime', JSON.stringify([]));
        localStorage.setItem('EveryMonth', JSON.stringify([]));
      }
    }
  }

  getRefCode() {
    let sceletonDomain: string = '';
    let domain: string = this.document.location.href;

    if (domain.includes('https')) {
      sceletonDomain = domain.replace('https://', ' ');
    } else if (domain.includes('http')) {
      sceletonDomain = domain.replace('http://', ' ');
    } else {
      sceletonDomain = domain;
    }
    if (sceletonDomain.includes('www')) {
      sceletonDomain = sceletonDomain.replace('www.', ' ');
    }
    sceletonDomain = sceletonDomain.trim();

    let splitedStr: any[];
    let finalSplittedStr: any[];
    if (sceletonDomain.includes('/')) {
      splitedStr = sceletonDomain.split('/');
      finalSplittedStr = splitedStr[0].split('.');
    } else {
      finalSplittedStr = sceletonDomain.split('.');
    }
    if (finalSplittedStr.length === 3) {
      if (!this.isStaging) {
        this.setReferrer(finalSplittedStr[0]);
      }

      this.dataService.setIsSubdomainStatus(true);
    } else {
      this.seoService.updateRobots('index,follow');

      this.dataService.setIsSubdomainStatus(false);
    }
  }

  setCountries() {
    this.sidebarApiService.getCountries().subscribe((countries: any) => {
      if (countries) {
        this.sidebarDataService.setCountries(countries);
      }
    });
  }

  setLanguagesForCountry(country: string) {
    this.sidebarApiService
      .getLanguagesForCountry(country)
      .subscribe((languageData: any) => {
        if (languageData) {
          this.sidebarDataService.setLanguagesData(languageData);
        }
      });
  }

  setCountry() {
    const routeUrl = this.document.location.pathname.split('/')[1];
    let country = '';

    let isDeepLinkPresentInUS = false;

    if (routeUrl.toLowerCase() === 'ca') {
      country = 'CA';
    } else if (routeUrl.toLowerCase() === 'au') {
      country = 'AU';
    } else if (routeUrl.toLowerCase() === 'mo') {
      country = 'MO';
    } else if (routeUrl.toLowerCase() === 'hk') {
      country = 'HK';
    } else if (routeUrl.toLowerCase() === 'sg') {
      country = 'SG';
    } else if (routeUrl.toLowerCase() === 'my') {
      country = 'MY';
    } else if (routeUrl.toLowerCase() === 'mx') {
      country = 'MX';
    } else if (routeUrl.toLowerCase() === 'nz') {
      country = 'NZ';
    } else if (routeUrl.toLowerCase() === 'de') {
      country = 'DE';
    } else if (routeUrl.toLowerCase() === 'gb') {
      country = 'GB';
    } else if (routeUrl.toLowerCase() === 'it') {
      country = 'IT';
    } else if (routeUrl.toLowerCase() === 'es') {
      country = 'ES';
    } else if (routeUrl.toLowerCase() === 'nl') {
      country = 'NL';
    } else if (routeUrl.toLowerCase() === 'at') {
      country = 'AT';
    } else if (routeUrl.toLowerCase() === 'pl') {
      country = 'PL';
    } else if (routeUrl.toLowerCase() === 'ie') {
      country = 'IE';
    } else if (routeUrl.toLowerCase() === 'se') {
      country = 'SE';
    } else if (routeUrl.toLowerCase() === 'hu') {
      country = 'HU';
    } else if (routeUrl.toLowerCase() === 'fr') {
      country = 'FR';
    } else if (routeUrl.toLowerCase() === 'pt') {
      country = 'PT';
    } else if (routeUrl.toLowerCase() === 'fi') {
      country = 'FI';
    } else if (routeUrl.toLowerCase() === 'be') {
      country = 'BE';
    } else if (routeUrl.toLowerCase() === 'ro') {
      country = 'RO';
    } else {
      country = 'US';

      if (routeUrl.toLowerCase() === 'us' || routeUrl.toLowerCase() === '') {
        isDeepLinkPresentInUS = false;
      } else {
        isDeepLinkPresentInUS = true;
      }
    }
    if (country === 'US') {
      if (!isDeepLinkPresentInUS) {
        this.dataService.changeDeepLinkStatus(false);
      } else {
        this.dataService.changeDeepLinkStatus(true);
      }
    } else {
      this.dataService.changeSelectedCountry(country);
    }
  }

  setCartStatus() {
    this.oneTimeCart = this.utilityService.getOneTimeStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    this.everyMonthCart = this.utilityService.getEveryMonthStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    const LocalPromoter = localStorage.getItem('Promoter');
    const promoterData = LocalPromoter ? JSON.parse(LocalPromoter) : null;

    let promoterFound = false;
    if (promoterData !== null) {
      this.dataService.setPromoterData(promoterData);

      promoterFound = promoterData.some(
        (promoter: any) =>
          promoter.country === this.selectedCountry &&
          promoter.language === this.selectedLanguage
      );
    }

    const LocalFoodDelivery = localStorage.getItem('FoodDelivery');
    let FoodDeliveryInfo: FoodDelivery = LocalFoodDelivery
      ? JSON.parse(LocalFoodDelivery)
      : null;

    if (!FoodDeliveryInfo) {
      FoodDeliveryInfo = {
        totalItems: 0,
        totalPrice: 0,
        appliedDiscount: 0,
      } as FoodDelivery;
    }

    if (
      this.oneTimeCart.length === 0 &&
      this.everyMonthCart.length === 0 &&
      !promoterFound &&
      FoodDeliveryInfo.totalItems === 0
    ) {
      this.sidebarDataService.changeCartStatus(false);
    } else {
      this.sidebarDataService.changeCartStatus(true);
    }
  }

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');

      if (refCode !== null && this.isStaging) {
        this.refCode = refCode;
        this.setReferrer(refCode);
      }
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage.subscribe((language: string) => {
      if (this.selectedLanguage !== '' && this.selectedLanguage !== language) {
        this.langCode = language;
      }
      this.selectedLanguage = language;
      this.translate.use(this.selectedLanguage);
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry.subscribe((country: string) => {
      if (this.selectedCountry !== '' && this.selectedCountry !== country) {
        this.langCode = '';
      }
      this.selectedCountry = country;
      this.getProducts(country, this.langCode);
      this.setLanguagesForCountry(country);
      this.setBlogs(country);
    });
  }

  setBlogs(country: string) {
    this.apiService.getBlogs(country).subscribe((blogs: any[]) => {
      if (blogs) {
        this.dataService.setBlogsData(blogs);
      }
    });
  }

  setTranslations(langCode: string) {
    let translationLangCode = '';
    if (langCode === 'zh-hans') translationLangCode = 'zh-Hans';
    else if (langCode === 'zh-hant') translationLangCode = 'zh-Hant';
    else if (langCode === 'pt-pt') translationLangCode = 'pt-PT';
    else if (langCode === 'es') translationLangCode = 'es-MX';
    else if (langCode === 'es-es') translationLangCode = 'es-ES';
    else translationLangCode = langCode;

    if (this.translationsList.length !== 0) {
      this.translationsList.forEach((translation: any) => {
        if (translation.code === translationLangCode) {
          this.apiService
            .getPhraseTranslation(translation.id)
            .subscribe((translations: any) => {
              this.translate.setTranslation(langCode, translations);
            });
        }
      });
    } else {
      this.apiService.getPhraseLanguages().subscribe((languages: any[]) => {
        languages.forEach((translation: any) => {
          if (translation.code === translationLangCode) {
            this.apiService
              .getPhraseTranslation(translation.id)
              .subscribe((translations: any) => {
                this.translate.setTranslation(langCode, translations);
              });
          }
        });
      });
    }
  }

  getProducts(country: string, language: string) {
    this.isLoaded = false;

    if (country !== '') {
      this.productsApiService
        .getProductsWithLanguage(country, language)
        .subscribe((data: any) => {
          this.productsWithLanguages = data;

          const LocalCookies = localStorage.getItem('Cookies');
          let hasCookies = LocalCookies ? JSON.parse(LocalCookies) : null;

          if (hasCookies !== null) {
            if (hasCookies) {
              this.showCookies = false;
            }
          } else {
            this.showCookies = true;
          }

          if (!this.isCodePresent) {
            this.isLoaded = true;
          }

          this.setCartStatus();
          this.productsDataService.setProductsData(data);
          this.setLanguage(data);
          this.getPromoterSku(data);
          this.getGeneralSettings(data);
          this.navigateToPage(data);
          this.isCookieAvailableForCountry(country);
          this.getCookieStatus();
        });
    }
  }

  getCookieStatus() {
    if (this.showCookies && this.appLoaded && this.isCookieForCountry) {
      this.isCookiePresent = 1;
    } else {
      this.isCookiePresent = 0;
      this.setFbChat();
    }
  }

  isCookieAvailableForCountry(countryCode: string) {
    if (
      countryCode === 'AT' ||
      countryCode === 'BE' ||
      countryCode === 'FI' ||
      countryCode === 'FR' ||
      countryCode === 'DE' ||
      countryCode === 'HU' ||
      countryCode === 'IE' ||
      countryCode === 'IT' ||
      countryCode === 'NL' ||
      countryCode === 'PL' ||
      countryCode === 'PT' ||
      countryCode === 'ES' ||
      countryCode === 'SE' ||
      countryCode === 'CH' ||
      countryCode === 'RO' ||
      countryCode === 'GB'
    ) {
      this.isCookieForCountry = true;
    } else {
      this.isCookieForCountry = false;
    }
  }

  navigateToPage(productsData: any) {
    if (productsData) {
      this.dataService.currentPageSlug.subscribe(
        (slugData: { url?: string; elementId?: number }) => {
          if (
            !(
              slugData &&
              Object.keys(slugData).length === 0 &&
              slugData.constructor === Object
            )
          ) {
            const pageSlug =
              slugData.url && slugData.elementId
                ? this.productsUtilityService.getPageSlug(
                    productsData,
                    slugData.url,
                    slugData.elementId
                  )
                : '';
            const redirectUrl = '/' + slugData.url + '/' + pageSlug;

            if (pageSlug === '') {
              this.utilityService.navigateToRoute(
                '/',
                this.selectedCountry,
                this.selectedLanguage,
                this.isStaging,
                this.refCode,
                this.defaultLanguage
              );
            } else {
              this.utilityService.navigateToRoute(
                redirectUrl,
                this.selectedCountry,
                this.selectedLanguage,
                this.isStaging,
                this.refCode,
                this.defaultLanguage
              );
            }
          }
        }
      );
    }
  }

  getGeneralSettings(productsData: any) {
    if (productsData) {
      this.generalSettings = productsData.general_settings;
    }
  }

  setReferrer(refCode: string) {
    this.apiService.getReferrer(refCode).subscribe((referrer: any) => {
      if (referrer.length !== 0) {
        this.setGAandPixelCode(referrer.fb_pixel_id);
        this.fbPageID = '' + referrer.fb_page_id;
        this.setFbChat();
        this.dataService.setReferrer(referrer);
        this.referrerVideoId = referrer.video_id ? referrer.video_id : '';
      } else {
        if (!this.isStaging) {
          window.location.href = this.clientDomain + this.router.url;
        }
      }
    });
  }

  setGAandPixelCode(pixelCode: string) {
    let scriptFBScript: HTMLElement = this.renderer.createElement('script');
    let scriptFBNoScript: HTMLElement = this.renderer.createElement('noscript');

    if (pixelCode !== '') {
      scriptFBScript.innerHTML =
        `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '` +
        pixelCode +
        `');
        fbq('track', 'PageView');`;

      scriptFBNoScript.innerHTML =
        `<img height="1" width="1"
        src="https://www.facebook.com/tr?id=` +
        pixelCode +
        `&ev=PageView&noscript=1"/>`;
    }

    this.renderer.appendChild(document.head, scriptFBScript);
    this.renderer.appendChild(document.head, scriptFBNoScript);
  }

  setLanguage(productsData: any) {
    this.defaultLanguage = productsData.default_lang;

    if (this.langCode === '') {
      this.setTranslations(this.defaultLanguage);
      this.dataService.changeSelectedLanguage(this.defaultLanguage);

      this.document.documentElement.lang =
        this.defaultLanguage + '-' + this.selectedCountry;
    } else {
      this.setTranslations(this.langCode);
      this.dataService.changeSelectedLanguage(this.langCode);

      this.document.documentElement.lang =
        this.langCode + '-' + this.selectedCountry;
    }
  }

  loginMVUser() {
    let redirectUrl = '';
    let isEditSelections = false;

    this.route.queryParamMap.subscribe((params) => {
      const code = params.get('code');
      const state = params.get('state');

      if (state !== null) {
        const routerUrl: string = JSON.parse(state);

        isEditSelections = routerUrl.includes('edit_selections=true');

        const tempRedirectRoute: string = routerUrl.includes('?')
          ? routerUrl.split('?')[0]
          : routerUrl;

        redirectUrl = tempRedirectRoute;
      }

      if (code !== null) {
        this.isCodePresent = true;

        this.foodApiService.getUsers(this.selectedCountry, code).subscribe(
          (userData) => {
            if (
              !(
                userData.user_info &&
                Object.keys(userData.user_info).length === 0 &&
                userData.user_info.constructor === Object
              )
            ) {
              if (redirectUrl.startsWith('/food')) {
                if (userData.user_info.mvuser_has_food_access) {
                  if (isEditSelections)
                    userData.user_info.isEditSelections = true;

                  localStorage.setItem(
                    'MVUser',
                    JSON.stringify(userData.user_info)
                  );

                  const currentTime = new Date().getTime();
                  localStorage.setItem('CartTime', JSON.stringify(currentTime));

                  window.location.href = redirectUrl;
                } else {
                  window.location.href = '/';
                }
              } else {
                localStorage.setItem(
                  'MVUser',
                  JSON.stringify(userData.user_info)
                );

                const currentTime = new Date().getTime();
                localStorage.setItem('CartTime', JSON.stringify(currentTime));

                window.location.href = redirectUrl;
              }
            } else {
              window.location.href = '/';
            }
          },
          () => {
            window.location.href = '/';
          }
        );
      }
    });
  }

  getPromoterSku(productsWithLanguages: any) {
    if (productsWithLanguages) {
      const productsSettings = productsWithLanguages.product_settings;

      localStorage.setItem(
        'PromoterSku',
        JSON.stringify(productsSettings.new_promoter_sku)
      );
    }
  }

  getSidebarName() {
    this.sidebarDataService.currentSidebarName.subscribe((name) => {
      this.sidebarName = name;

      if (name === '') {
        $('.drawer').drawer('close');
      }
    });
  }

  receiveMessage(name: string) {
    this.sidebarName = name;

    if (name === '') {
      $('.drawer').drawer('close');
    }
  }

  onActivate() {
    const routePath = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;

    this.isRootRoute = routePath === '/';

    if (this.isBrowser) {
      $('#exampleModalCenter').modal('hide');
      $('#joinAsPromoterModal').modal('hide');
      $('#pruvitTVModal').modal('hide');
      $('#shareCartModal').modal('hide');
      $('#referrerCode').modal('hide');
      $('#referrerBy').modal('hide');
      $('#independentPruver').modal('hide');

      if ($('.drawer-open').length > 0) {
        $('.drawer').drawer('close');
      }

      window.scroll(0, 0);
    }
  }

  createCurrentProductModal() {
    this.productsDataService.currentPostName.subscribe((postName: string) => {
      if (postName === '') {
        this.modalcontainer.clear();
        this.changeDetectionRef.detectChanges();
      } else if (postName === 'pruvit-modal-utilities') {
        this.modalcontainer.clear();
        this.changeDetectionRef.detectChanges();
        this.createPromoterModalComponent();
      } else if (postName === 'purchase-modal') {
        this.modalcontainer.clear();
        this.changeDetectionRef.detectChanges();
        this.createPurchaseWarningModalComponent();
      } else if (postName === 'zip-modal') {
        this.modalcontainer.clear();
        this.changeDetectionRef.detectChanges();
        this.createZipModalComponent();
      } else {
        this.createProductModalComponent(postName);
      }
    });
  }

  createCurrentFoodModal() {
    this.store
      .select('foodsList')
      .pipe(map((res) => res.modalId))
      .subscribe((id: string) => {
        if (id !== '') {
          if (this.currentModalId !== id) {
            this.modalcontainer.clear();
          }

          this.currentModalId = id;
          this.createFoodModalComponent(id);
        }
      });
  }

  createCurrentCheckoutModal() {
    this.dataService.currentModals.subscribe((modals: any[]) => {
      this.modalcontainer.clear();
      this.changeDetectionRef.detectChanges();
      this.createCheckoutModalComponent(modals);
    });
  }

  createProductModalComponent(postName: string) {
    this.modalcontainer.clear();
    const factory = this.resolver.resolveComponentFactory(
      ModalProductsComponent
    );
    this.modalComponentRef = this.modalcontainer.createComponent(factory);
    this.modalComponentRef.instance.postName = postName;
  }

  createFoodModalComponent(foodId: string) {
    const factory = this.resolver.resolveComponentFactory(ModalFoodsComponent);
    this.modalComponentRef = this.modalcontainer.createComponent(factory);
    this.modalComponentRef.instance.foodId = foodId;
  }

  createCheckoutModalComponent(modals: any[]) {
    this.modalcontainer.clear();
    const factory = this.resolver.resolveComponentFactory(
      ModalCheckoutComponent
    );
    this.modalComponentRef = this.modalcontainer.createComponent(factory);
    this.modalComponentRef.instance.modals = modals;
  }

  createPromoterModalComponent() {
    this.modalcontainer.clear();
    const factory = this.resolver.resolveComponentFactory(
      ModalUtilitiesComponent
    );
    this.modalComponentRef = this.modalcontainer.createComponent(factory);
  }

  createPurchaseWarningModalComponent() {
    this.modalcontainer.clear();
    const factory = this.resolver.resolveComponentFactory(
      ModalPurchaseWarningComponent
    );
    this.modalComponentRef = this.modalcontainer.createComponent(factory);
  }

  createZipModalComponent() {
    this.modalcontainer.clear();
    const factory = this.resolver.resolveComponentFactory(ModalZipComponent);
    this.modalComponentRef = this.modalcontainer.createComponent(factory);
  }

  destroyModalComponent() {
    this.modalComponentRef.destroy();
  }

  setFbChat() {
    const initParams: InitParams = {
      xfbml: true,
      version: 'v3.2',
    };
    if (this.isBrowser) {
      setTimeout(() => {
        this.fb.init(initParams);
      }, 0);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeySlashHandler(event: any) {
    if (event.code === 'Slash') {
      this.renderer.addClass(document.body, 'search-focus');
      this.dataService.changeBodyClassStatus(true);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: any) {
    let searchClass: string | null =
      event.srcElement.parentElement?.classList.value;

    if (!searchClass?.includes('search-enable-pruvit-nav')) {
      this.renderer.removeClass(document.body, 'search-focus');
      this.dataService.changeBodyClassStatus(false);
    }

    if (event.srcElement.id === 'checkout__widget') {
      this.utilityService.confirmWithCloseCheckoutWidget();
    }
  }

  onClickAccept() {
    localStorage.setItem('Cookies', JSON.stringify(true));
    this.showCookies = false;
    this.appLoaded = false;
    this.isCookieForCountry = false;
    this.isCookiePresent = 0;
    this.setFbChat();
  }

  onClickCloseVideo() {
    this.referrerVideoId = '';
  }
}
