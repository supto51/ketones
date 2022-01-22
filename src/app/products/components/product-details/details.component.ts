import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../services/products-data.service';
declare var $: any;

@Component({
  selector: 'app-detail',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class ProductDetailComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  selectedLanguage = '';
  selectedCountry = '';
  products: any[] = [];
  product: any = {};
  discountHeight = 0;
  defaultLanguage = '';
  refCode = '';
  clientId = '';
  returningUrl = '';
  clientDomain = '';
  isStaging: boolean;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private productsDataService: ProductsDataService,
    private seoService: AppSeoService
  ) {
    this.isStaging = environment.isStaging;
    this.returningUrl = environment.returningURL;
    this.clientId = environment.clientID;
    this.clientDomain = environment.clientDomainURL;
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
  }

  ngAfterViewInit() {
    $(document).ready(() => {
      $('.drawer').drawer({
        iscroll: {
          mouseWheel: true,
          scrollbars: true,
          bounce: false,
        },
      });
    });
  }

  getDiscountHeight() {
    this.renderer.removeClass(document.body, 'body-gray');
    this.renderer.removeClass(document.body, 'extr-padd-btm');

    this.dataService.currentDiscountHeight.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.getProducts();
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getQueryParams() {
    if (this.isStaging) {
      this.activatedRoute.queryParamMap.subscribe((params) => {
        const refCode = params.get('ref');
        if (refCode !== null) {
          this.refCode = refCode;
        }
      });
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            this.refCode = referrer.code;
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
            this.products = productsData.list;
            this.defaultLanguage = productsData.default_lang;
            this.getProduct();
          }
        }
      )
    );
  }

  getProduct() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.product = {};
        this.setRedirectURL();

        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            if (product.post_name === params['id']) {
              this.product = product;
              window.scroll(0, 0);

              if (product.mvp_custom_users === 'on') {
                this.getMVUser(product);
              }
            }
          });
        }

        this.setSeo();
      })
    );
  }

  getMVUser(product: any) {
    const LocalMVUser = localStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    if (
      MVUser === null ||
      (MVUser &&
        Object.keys(MVUser).length === 0 &&
        MVUser.constructor === Object)
    ) {
      window.location.href = `${
        this.returningUrl
      }connect/authorize?response_type=code&redirect_uri=${
        this.clientDomain
      }/&client_id=${
        this.clientId
      }&scope=openid%20offline_access%20newgen&state=${JSON.stringify(
        this.router.url
      )}`;
    } else {
      const LocalCartTime = localStorage.getItem('CartTime');
      const cartStorageValue = LocalCartTime ? JSON.parse(LocalCartTime) : null;

      const currentTime = new Date().getTime();

      if (cartStorageValue !== null) {
        const timeDifference = (currentTime - cartStorageValue) / 1000;

        if (timeDifference > MVUser.token_expire_time) {
          localStorage.removeItem('MVUser');
          localStorage.setItem('OneTime', JSON.stringify([]));
          localStorage.setItem('EveryMonth', JSON.stringify([]));
          localStorage.removeItem('Promoter');

          window.location.href = `${
            this.returningUrl
          }connect/authorize?response_type=code&redirect_uri=${
            this.clientDomain
          }/&client_id=${
            this.clientId
          }&scope=openid%20offline_access%20newgen&state=${JSON.stringify(
            this.router.url
          )}`;
        } else {
          if (product.mvp_custom_users_list) {
            const users = product.mvp_custom_users_list;
            const userIndex = users.findIndex(
              (user: any) => +user[0] === MVUser.mvuser_id
            );

            if (userIndex === -1) {
              window.location.href = '/';
            }
          }
        }
      } else {
        localStorage.removeItem('MVUser');
        localStorage.setItem('OneTime', JSON.stringify([]));
        localStorage.setItem('EveryMonth', JSON.stringify([]));
        localStorage.removeItem('Promoter');

        window.location.href = `${
          this.returningUrl
        }connect/authorize?response_type=code&redirect_uri=${
          this.clientDomain
        }/&client_id=${
          this.clientId
        }&scope=openid%20offline_access%20newgen&state=${JSON.stringify(
          this.router.url
        )}`;
      }
    }
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    if (
      this.product &&
      Object.keys(this.product).length === 0 &&
      this.product.constructor === Object
    ) {
      this.seoService.updateTitle('Page not found');

      this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
        if (!status) {
          this.seoService.updateRobots('noindex,follow');
        }
      });
    }
  }

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
