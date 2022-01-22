import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Renderer2,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { SearchPipe } from 'src/app/shared/pipes/search.pipe';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { SearchBlogPipe } from 'src/app/shared/pipes/search-blog.pipe';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
declare var headerSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [SearchPipe, SearchBlogPipe],
})
export class HeaderComponent implements OnInit {
  @Output() messageEvent = new EventEmitter();
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchInputMobile') searchInputMobile!: ElementRef;
  @ViewChild('discountBanner') discountBanner!: ElementRef;
  selectedLanguage = '';
  selectedCountry = '';
  cartStatus = false;
  refCode = '';
  userRedirectURL = '';
  isSearchShowable = true;
  isInputFocused = false;
  isMobileInputClicked = false;
  products: any[] = [];
  searchFilter = '';
  listIndex = -1;
  defaultLanguage = '';
  isStaging: boolean;
  deepLinkStatus: number | null = null;
  redirectedCountryFlag = '';
  redirectedCountryName = '';
  countries: any[] = [];
  americas: any[] = [];
  asiaPacifics: any[] = [];
  europes: any[] = [];
  isFromOfferFlow = false;
  productsData: any = {};
  blogs: any[] = [];
  bannerArray: any[] = [];
  categories: any[] = [];
  discountHeight = 0;

  constructor(
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private renderer: Renderer2,
    private searchPipe: SearchPipe,
    private apiService: AppApiService,
    private productsDataService: ProductsDataService,
    private sidebarDataService: SidebarDataService,
    private router: Router,
    private searchBlogPipe: SearchBlogPipe,
    private productsUtilityService: ProductsUtilityService
  ) {
    this.userRedirectURL = environment.userURL;
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getCountries();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCartStatus();
    this.getQueryParams();
    this.getRedirectURL();
    this.getBodyClassStatus();
    this.getDeepLinkStatus();
    this.getOfferFlowStatus();
    this.getBlogs();
  }

  getBlogs() {
    this.dataService.currentBlogsData.subscribe((blogs: any[]) => {
      this.blogs = blogs;
    });
  }

  getCountries() {
    this.sidebarDataService.currentCountries.subscribe((countries: any) => {
      if (countries) {
        this.countries = countries.filter(
          (country: any) => country.active === '1'
        );
        this.getGroupWiseCountries(this.countries);
      }
    });
  }

  getOfferFlowStatus() {
    this.dataService.currentOfferFlowStatus.subscribe((status: boolean) => {
      this.isFromOfferFlow = status;
    });
  }

  getGroupWiseCountries(countries: any[]) {
    const tempAmericas: any[] = [],
      tempAsiaPacifics: any[] = [],
      tempEuropes: any[] = [];

    countries.forEach((country: any) => {
      if (
        country.country_code === 'CA' ||
        country.country_code === 'MX' ||
        country.country_code === 'US'
      ) {
        tempAmericas.push(country);
      }
      if (
        country.country_code === 'AU' ||
        country.country_code === 'HK' ||
        country.country_code === 'MO' ||
        country.country_code === 'MY' ||
        country.country_code === 'NZ' ||
        country.country_code === 'SG' ||
        country.country_code === 'TW'
      ) {
        tempAsiaPacifics.push(country);
      }
      if (
        country.country_code === 'AT' ||
        country.country_code === 'BE' ||
        country.country_code === 'FI' ||
        country.country_code === 'FR' ||
        country.country_code === 'DE' ||
        country.country_code === 'HU' ||
        country.country_code === 'IE' ||
        country.country_code === 'IT' ||
        country.country_code === 'NL' ||
        country.country_code === 'PL' ||
        country.country_code === 'PT' ||
        country.country_code === 'ES' ||
        country.country_code === 'SE' ||
        country.country_code === 'CH' ||
        country.country_code === 'RO' ||
        country.country_code === 'GB'
      ) {
        tempEuropes.push(country);
      }
    });
    this.americas = this.sortCountryName(tempAmericas);
    this.asiaPacifics = this.sortCountryName(tempAsiaPacifics);
    this.europes = this.sortCountryName(tempEuropes);
  }

  sortCountryName(countries: any[]) {
    return countries.sort((a: any, b: any) => (a.country > b.country ? 1 : -1));
  }

  getDeepLinkStatus() {
    this.dataService.currentDeepLinkPresent.subscribe((status) => {
      if (status === null) {
        this.deepLinkStatus = -1;

        this.redirectedCountryFlag = '';
      } else if (status) {
        this.deepLinkStatus = -1;

        this.dataService.changeSelectedCountry('US');
      } else {
        this.deepLinkStatus = -1;

        const LocalConfirmedCountry = localStorage.getItem('ConfirmedCountry');
        let hasRedirectedCountry = LocalConfirmedCountry
          ? JSON.parse(LocalConfirmedCountry)
          : null;

        if (hasRedirectedCountry !== null && hasRedirectedCountry !== '') {
          const translateMode: any =
            this.utilityService.getUrlParameter('phrase_context');

          if (translateMode !== false) {
            hasRedirectedCountry = 'US';
          } else {
            this.utilityService.navigateToRoute(
              '/',
              hasRedirectedCountry,
              'en',
              this.isStaging,
              '',
              'en'
            );
          }

          this.dataService.changeSelectedCountry(hasRedirectedCountry);

          this.redirectedCountryFlag = hasRedirectedCountry;

          this.sidebarDataService.currentCountries.subscribe(
            (countries: any) => {
              if (countries) {
                const allCountries: any[] = countries;

                allCountries.forEach((country: any) => {
                  if (country.country_code === hasRedirectedCountry) {
                    this.redirectedCountryName = country.country;
                  }
                });
              }
            }
          );
        } else {
          this.apiService.getGeoCountryCode().subscribe(
            (res: any) => {
              if (res) {
                if (
                  res.country_code.toLowerCase() === 'ca' ||
                  res.country_code.toLowerCase() === 'au' ||
                  res.country_code.toLowerCase() === 'mo' ||
                  res.country_code.toLowerCase() === 'hk' ||
                  res.country_code.toLowerCase() === 'sg' ||
                  res.country_code.toLowerCase() === 'my' ||
                  res.country_code.toLowerCase() === 'mx' ||
                  res.country_code.toLowerCase() === 'nz' ||
                  res.country_code.toLowerCase() === 'de' ||
                  res.country_code.toLowerCase() === 'gb' ||
                  res.country_code.toLowerCase() === 'it' ||
                  res.country_code.toLowerCase() === 'es' ||
                  res.country_code.toLowerCase() === 'nl' ||
                  res.country_code.toLowerCase() === 'at' ||
                  res.country_code.toLowerCase() === 'pl' ||
                  res.country_code.toLowerCase() === 'ie' ||
                  res.country_code.toLowerCase() === 'se' ||
                  res.country_code.toLowerCase() === 'hu' ||
                  res.country_code.toLowerCase() === 'fr' ||
                  res.country_code.toLowerCase() === 'pt' ||
                  res.country_code.toLowerCase() === 'fi' ||
                  res.country_code.toLowerCase() === 'ro' ||
                  res.country_code.toLowerCase() === 'be'
                ) {
                  this.deepLinkStatus = 0;

                  this.utilityService.navigateToRoute(
                    '/',
                    res.country_code,
                    'en',
                    this.isStaging,
                    '',
                    'en'
                  );

                  this.dataService.changeSelectedCountry(res.country_code);

                  this.redirectedCountryFlag = res.country_code;

                  this.sidebarDataService.currentCountries.subscribe(
                    (countries: any) => {
                      if (countries) {
                        const allCountries: any[] = countries;

                        allCountries.forEach((country: any) => {
                          if (
                            country.country_code === this.redirectedCountryFlag
                          ) {
                            this.redirectedCountryName = country.country;
                          }
                        });
                      }
                    }
                  );
                } else {
                  this.dataService.changeSelectedCountry('US');
                }
              } else {
                this.dataService.changeSelectedCountry('US');
              }
            },
            (error: any) => {
              this.dataService.changeSelectedCountry('US');
            }
          );
        }
      }
    });
  }

  getBodyClassStatus() {
    this.dataService.currentBodyHasClass.subscribe((status) => {
      if (!status) {
        this.isInputFocused = false;
        this.isMobileInputClicked = false;
      } else {
        this.isInputFocused = true;
        setTimeout(() => {
          if (this.searchInput) {
            this.searchInput.nativeElement.focus();
          }
        }, 0);
      }
    });
  }

  getRedirectURL() {
    this.dataService.currentRedirectURL.subscribe((url: string) => {
      if (url === 'search' || url === '/search/') {
        this.isSearchShowable = false;
      } else {
        this.isSearchShowable = true;
      }
    });
  }

  getCartStatus() {
    this.sidebarDataService.currentCartStatus.subscribe((status) => {
      if (status === null) {
        this.cartStatus = this.getLocalStorageCartStatus();
      } else {
        this.cartStatus = status;
      }
    });
  }

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getLocalStorageCartStatus() {
    let cartStatus: boolean;
    const LocalOneTime = localStorage.getItem('OneTime');
    let cartOneTime: any[] = LocalOneTime ? JSON.parse(LocalOneTime) : null;

    const LocalEveryMonth = localStorage.getItem('EveryMonth');
    let cartEveryMonth: any[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : null;

    let oneTimeSelectedLanguage = [];
    let everyMonthSelectedLanguage = [];

    if (cartOneTime === null) {
      cartOneTime = [];
    }

    if (cartEveryMonth === null) {
      cartEveryMonth = [];
    }

    const tempOneTimeCart: any[] = [];
    cartOneTime.forEach((oneTime) => {
      if (
        (oneTime.country === this.selectedCountry.toLowerCase() &&
          oneTime.language === this.selectedLanguage &&
          oneTime.orderType === 'ordertype_1') ||
        (oneTime.country === this.selectedCountry.toLowerCase() &&
          oneTime.language === this.selectedLanguage &&
          oneTime.orderType === 'ordertype_3')
      ) {
        tempOneTimeCart.push(oneTime);
      }
    });
    oneTimeSelectedLanguage = tempOneTimeCart;

    const tempEveryMonthCart: any[] = [];
    cartEveryMonth.forEach((everyMonth) => {
      if (
        (everyMonth.country === this.selectedCountry.toLowerCase() &&
          everyMonth.language === this.selectedLanguage &&
          everyMonth.orderType === 'ordertype_2') ||
        (everyMonth.country === this.selectedCountry.toLowerCase() &&
          everyMonth.language === this.selectedLanguage &&
          everyMonth.orderType === 'ordertype_3')
      ) {
        tempEveryMonthCart.push(everyMonth);
      }
    });
    everyMonthSelectedLanguage = tempEveryMonthCart;

    if (
      oneTimeSelectedLanguage.length === 0 &&
      everyMonthSelectedLanguage.length === 0
    ) {
      cartStatus = false;
    } else {
      cartStatus = true;
    }
    return cartStatus;
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage.subscribe((language: string) => {
      this.selectedLanguage = language;
      this.translate.use(this.selectedLanguage);

      this.getProducts();
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry.subscribe((countryCode: string) => {
      this.selectedCountry = countryCode;
    });
  }

  getProducts() {
    this.bannerArray = [];
    this.productsDataService.currentProductsData.subscribe(
      (productsData: any) => {
        if (productsData) {
          this.defaultLanguage = productsData.default_lang;

          this.productsData = productsData;

          if (productsData) {
            this.products = productsData.list.filter(
              (product: any) =>
                product.mvp_visitor === 'on' &&
                product.mvp_custom_users !== 'on'
            );

            const bannerArray = productsData.banner;
            this.getBanner(bannerArray);
            this.getCategories();
          }

          setTimeout(() => {
            if (this.discountBanner) {
              this.discountHeight =
                this.discountBanner.nativeElement.offsetHeight;
              this.dataService.changeDiscountHeight(this.discountHeight);
            }
          }, 0);
        }
      }
    );
  }

  getCategories() {
    let categoriesData: any[] = [];
    if (this.productsData.hasOwnProperty('parent_category')) {
      categoriesData = Object.values(this.productsData.parent_category);
    }

    const availableCategories: any[] = [];
    if (categoriesData.length > 0) {
      categoriesData.forEach((categoryItem: any) => {
        const categoryInfo = this.productsUtilityService.getCategory(
          categoriesData,
          categoryItem.slug
        ).category;

        const categoryProducts = [];

        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            const result = product.categories.some(
              (x: any) =>
                x.term_id === categoryInfo.term_id ||
                x.parent === categoryInfo.term_id
            );
            if (result) {
              categoryProducts.push(product);
            }
          });
        }

        if (categoryProducts.length > 0) {
          availableCategories.push(categoryItem);
        }
      });
    }

    this.categories = availableCategories;
  }

  getBanner(bannerArray: any[]) {
    if (bannerArray) {
      bannerArray.forEach((banner: any) => {
        banner.countDown$ = this.getCountdownText(banner);
      });
      this.bannerArray = bannerArray;
    }

    const bannerSlick = $('.offer-slider.slick-initialized.slick-slider');

    if (bannerSlick.length > 0) {
      $('.offer-slider').slick('unslick');
    }

    setTimeout(() => {
      headerSliderJS();
    });
  }

  getBannerTitle(bannerText: string) {
    if (bannerText) {
      return bannerText.replace(/href/gi, 'data-link');
    } else {
      return '';
    }
  }

  getCountdownText(bannerInfo: any): Observable<string> {
    const countdownTimer = timer(0, 1000).pipe(
      switchMap(() => {
        let countdownText = '';
        let tempCountdown = '';

        const countdownEndDate = Date.parse(
          new Date(+bannerInfo.end_date * 1000).toLocaleString('en-US', {
            timeZone: 'America/Chicago',
          })
        );

        const today = Date.parse(
          new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
        );

        const distance = countdownEndDate - today;

        if (distance < 0) {
          countdownText = '';
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          tempCountdown =
            bannerInfo.countdown_text +
            ' ' +
            days +
            'd ' +
            hours +
            'h ' +
            minutes +
            'm ' +
            seconds +
            's';

          countdownText =
            bannerInfo.enable_countdown !== ''
              ? '<span style="color:' +
                bannerInfo.countdown_text_color +
                '">' +
                tempCountdown +
                '</span>'
              : '';
        }
        return of(countdownText);
      })
    );

    return countdownTimer;
  }

  onClickCart() {
    if (this.isFromOfferFlow) {
      const availableOffers: any[] = [];

      const cartOneTime = this.utilityService.getOneTimeStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const cartEveryMonth = this.utilityService.getEveryMonthStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      if (this.productsData.hasOwnProperty('offer')) {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'cart_total') {
            const includeRegularDiscount =
              offer?.include_regular_discount === 'on' ? true : false;

            const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
              includeRegularDiscount,
              +offer.price_over,
              +offer.price_under,
              [],
              this.selectedCountry.toLowerCase(),
              this.selectedLanguage
            );

            const isOfferSkuFound = this.getOfferSkuFoundStatus(
              offer,
              cartOneTime,
              cartEveryMonth
            );

            if (cartTotalOfferFound && !isOfferSkuFound) {
              availableOffers.push(offer);
            }
          }
          if (offer.offer_type === 'sku_purchase') {
            let skuBasedOfferFound = false;

            cartOneTime.forEach((cartOneTime: any) => {
              offer.qualify_sku.onetime.forEach((qualifiedOneTime: any) => {
                if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
                  skuBasedOfferFound = true;
                }
              });
            });

            cartEveryMonth.forEach((cartEveryMonth: any) => {
              offer.qualify_sku.smartship.forEach((qualifiedSmartship: any) => {
                if (
                  cartEveryMonth.cart.productSku.everyMonth ===
                  qualifiedSmartship
                ) {
                  skuBasedOfferFound = true;
                }
              });
            });

            const isOfferSkuFound = this.getOfferSkuFoundStatus(
              offer,
              cartOneTime,
              cartEveryMonth
            );

            if (skuBasedOfferFound && !isOfferSkuFound) {
              availableOffers.push(offer);
            }
          }
        });
      }

      this.dataService.setOfferFlowStatus(false);

      if (availableOffers.length > 0) {
        this.dataService.setOfferArray(availableOffers, 0);

        this.productsDataService.changePostName('pruvit-modal-utilities');
        $('#special-offer').modal('show');
      } else {
        this.messageEvent.emit('checkout-cart');

        setTimeout(() => {
          $('.drawer').drawer('open');
        }, 0);
      }
    } else {
      this.messageEvent.emit('checkout-cart');

      setTimeout(() => {
        $('.drawer').drawer('open');
      }, 0);
    }
  }

  onClickCountry() {
    this.messageEvent.emit('country-bar');
  }

  onClickLogo() {
    this.utilityService.navigateToRoute(
      '/',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickBanner(event: any) {
    if (event.srcElement) {
      const link: string = event.srcElement.parentElement.dataset.link;

      if (link) {
        const linkSplit = link.split('/');
        let routeURL = '';

        if (this.selectedCountry === 'US') {
          routeURL = linkSplit[1] + '/' + linkSplit[2];
        } else {
          routeURL = '/' + linkSplit[2] + '/' + linkSplit[3];
        }

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
  }

  onClickUser() {
    window.location.href = this.userRedirectURL;
  }

  onDesktopSearch() {
    this.isInputFocused = true;
    this.renderer.addClass(document.body, 'search-focus');
  }

  onMobileSearch() {
    this.isMobileInputClicked = true;
    this.renderer.addClass(document.body, 'search-focus');

    setTimeout(() => {
      if (this.searchInputMobile) {
        this.renderer
          .selectRootElement(this.searchInputMobile.nativeElement)
          .focus();
        this.searchInputMobile.nativeElement.focus();
      }
    }, 0);
  }

  onInput() {
    this.isInputFocused = true;
    this.renderer.addClass(document.body, 'search-focus');
  }

  onClickProduct(postName: string) {
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
    $('#SearchBoxModal').modal('hide');
    this.renderer.removeClass(document.body, 'search-focus');
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
    this.dataService.changeBodyClassStatus(false);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickSeeResults() {
    this.dataService.changeRedirectURL('search');
    this.dataService.searchData = this.searchFilter;

    this.utilityService.navigateToRoute(
      '/search',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
    $('#SearchBoxModal').modal('hide');
    this.renderer.removeClass(document.body, 'search-focus');
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
    this.dataService.changeBodyClassStatus(false);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  @HostListener('document:keydown', ['$event'])
  onKeySlashHandler(event: any) {
    if (this.isInputFocused) {
      let filteredProducts: any[] = this.searchPipe.transform(
        this.products,
        this.searchFilter,
        'search-modal'
      );
      let filteredBlogs: any[] = this.searchBlogPipe.transform(
        this.blogs,
        this.searchFilter
      );
      const productsSplitedLength =
        filteredProducts.length > 4 ? 5 : filteredProducts.length;
      const blogsSplitedLength =
        filteredBlogs.length > 4 ? 4 : filteredBlogs.length;

      if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
        if (this.listIndex > -1) {
          this.listIndex--;
        }
      }
      if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
        if (this.listIndex < productsSplitedLength + blogsSplitedLength + 5) {
          this.listIndex++;
        }
      }

      const quickIndex = productsSplitedLength + blogsSplitedLength;

      if (event.code === 'Enter') {
        if (this.listIndex === quickIndex + 0) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052368331-COVID-Notice';
        }
        if (this.listIndex === quickIndex + 1) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052059231-Update-SmartShip-auto-ship-Date';
        }
        if (this.listIndex === quickIndex + 2) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052058131-Update-My-Personal-Information';
        }
        if (this.listIndex === quickIndex + 3) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360045633072-Pr%C3%BCvit-Product-Guide';
        }
        if (this.listIndex === quickIndex + 4) {
          window.location.href = 'https://support.justpruvit.com/';
        }

        if (this.listIndex > -1) {
          if (this.listIndex < productsSplitedLength) {
            if (filteredProducts.length > 0) {
              if (this.listIndex === 4) {
                this.onClickSeeResults();
              } else {
                const activatedProduct = filteredProducts.find(
                  (x: any, i: number) => i === this.listIndex
                );
                if (activatedProduct) {
                  this.onClickProduct(activatedProduct.post_name);
                }
              }
            }
          } else {
            if (filteredBlogs.length > 0) {
              const activatedBlog = filteredBlogs.find(
                (x: any, i: number) =>
                  i + productsSplitedLength === this.listIndex
              );
              if (activatedBlog) {
                this.onClickBlog(activatedBlog.slug);
              }
            }
          }
        } else {
          if (filteredProducts.length === 1) {
            this.onClickProduct(filteredProducts[0].post_name);
          } else if (filteredBlogs.length === 1) {
            this.onClickBlog(filteredBlogs[0].slug);
          } else {
            this.onClickSeeResults();
          }
        }
      }
    }
    if (event.code === 'Escape') {
      this.renderer.removeClass(document.body, 'search-focus');
      this.dataService.changeBodyClassStatus(false);

      if (this.searchInput) {
        this.searchInput.nativeElement.blur();
      }
    }
  }

  setQuickLinkActiveClass(
    itemIndex: number,
    productsLength: number,
    blogsLength: number
  ) {
    const productsSplitedLength = productsLength > 4 ? 5 : productsLength;
    const blogsSplitedLength = blogsLength > 4 ? 4 : blogsLength;

    return itemIndex + productsSplitedLength + blogsSplitedLength;
  }

  setBlogActiveClass(itemIndex: number, productsLength: number) {
    const productsSplitedLength = productsLength > 4 ? 5 : productsLength;

    return itemIndex + productsSplitedLength;
  }

  getTranslatedSearchPruvit() {
    if (this.searchInput) {
      this.translate.get('search-pruvit').subscribe((res: string) => {
        this.searchInput.nativeElement.placeholder = res;
      });
    }
  }

  onClickCloseLocation() {
    this.deepLinkStatus = -1;

    setTimeout(() => {
      if (this.discountBanner) {
        this.discountHeight = this.discountBanner.nativeElement.offsetHeight;
        this.dataService.changeDiscountHeight(this.discountHeight);
      }
    }, 0);
  }

  onClickContinueLocation() {
    if (this.deepLinkStatus === 1) {
      this.dataService.changeSelectedCountry(this.redirectedCountryFlag);

      this.utilityService.navigateToRoute(
        '/',
        this.redirectedCountryFlag,
        'en',
        this.isStaging,
        '',
        'en'
      );

      this.onClickCloseLocation();
    }
    if (this.deepLinkStatus === 0) {
      localStorage.setItem(
        'ConfirmedCountry',
        JSON.stringify(this.redirectedCountryFlag)
      );

      if (this.selectedCountry !== this.redirectedCountryFlag) {
        this.utilityService.navigateToRoute(
          '/',
          this.redirectedCountryFlag,
          'en',
          this.isStaging,
          '',
          'en'
        );

        this.dataService.changeSelectedCountry(this.redirectedCountryFlag);
      }

      this.onClickCloseLocation();
    }
  }

  onChangeCountry(countryCode: string) {
    this.redirectedCountryFlag = countryCode;

    this.countries.forEach((country: any) => {
      if (country.country_code === this.redirectedCountryFlag) {
        this.redirectedCountryName = country.country;
      }
    });
  }

  getOfferSkuFoundStatus(
    offer: any,
    oneTimeCart: any[],
    everyMonthCart: any[]
  ) {
    const offeredSkus: any[] = [];
    let offeredSkuFound = false;

    const availableVariations = Object.values(
      offer.product.product_info.mvp_variations
    ).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );
    availableVariations.forEach((variation: any) => {
      offeredSkus.push(variation.mvproduct_sku);
    });

    oneTimeCart.forEach((cartOneTime: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartOneTime.cart.productSku.oneTime === sku) {
          offeredSkuFound = true;
        }
      });
    });

    everyMonthCart.forEach((cartEveryMonth: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartEveryMonth.cart.productSku.everyMonth === sku) {
          offeredSkuFound = true;
        }
      });
    });

    return offeredSkuFound;
  }

  onClickBlog(blogSlug: string) {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog' + '/' + blogSlug]);
    } else {
      this.router.navigate([
        this.selectedCountry.toLowerCase() + '/' + 'blog' + '/' + blogSlug,
      ]);
    }
    $('#SearchBoxModal').modal('hide');
    this.renderer.removeClass(document.body, 'search-focus');
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
    this.dataService.changeBodyClassStatus(false);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onHoverNavbarShow() {
    this.renderer.addClass(document.body, 'navbar-show');
  }

  onHoverNavbarHide() {
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickResearchPage() {
    const routeURL = '/research';

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickBlogPage() {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog']);
    } else {
      this.router.navigate([this.selectedCountry.toLowerCase() + '/' + 'blog']);
    }

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickSmartshipSavePage() {
    const routeURL = '/smartship/about';

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickPromoterPage() {
    const routeURL = '/promoter';

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickShopAllPage() {
    let shopAllSlug = '';
    const categories = Object.values(this.productsData.parent_category);

    categories.forEach((category: any) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;

    const routeURL = '/category/' + shopAllSlug;

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug) {
      const routeURL = '/category/' + categorySlug;
      this.utilityService.navigateToRoute(
        routeURL,
        this.selectedCountry,
        this.selectedLanguage,
        this.isStaging,
        this.refCode,
        this.defaultLanguage
      );
    }

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  enableLearnMenuItem() {
    if (this.selectedCountry === 'US' || this.selectedCountry === 'CA') {
      return true;
    } else {
      return false;
    }
  }

  enableOtherMenuItem() {
    if (
      this.selectedCountry === 'US' ||
      this.selectedCountry === 'CA' ||
      this.selectedCountry === 'AU' ||
      this.selectedCountry === 'NZ'
    ) {
      return true;
    } else {
      return false;
    }
  }
}
