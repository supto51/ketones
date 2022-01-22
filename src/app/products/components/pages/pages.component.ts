import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var leaderBoardJS: any;
declare var $: any;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  pages = [];
  page = '';
  currentUrl: any;
  discountHeight = 0;
  refCode = '';
  isStaging: boolean;
  defaultLanguage = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private productsDataService: ProductsDataService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getCurrentRoute();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getDiscountHeight();
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

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry.subscribe((country: string) => {
      this.selectedCountry = country;
      this.setRedirectURL();
    });
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getCurrentRoute() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.currentUrl = params['id'];
        this.getPages();
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.getPages();
      })
    );
  }

  getPages() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            if (productsData) {
              this.pages = productsData.page;
              if (this.pages) {
                this.getPage(this.pages);
              }
            }
          }
        }
      )
    );
  }

  getPage(pages: any[]) {
    this.page = '';
    this.setRedirectURL();

    pages.forEach((page: any) => {
      if (page.slug === this.currentUrl) {
        let str = page.content.replace(/#/gi, this.router.url + '#');
        if (this.currentUrl === 'shipping-policy') {
          str = str.replace('href="/refunds/"', 'id="refunds-page-id"');
        }
        this.page = str;
        window.scroll(0, 0);

        $(document).ready(() => {
          leaderBoardJS();
        });
      }
    });
  }

  @HostListener('click', ['$event'])
  onClickRefundsPage(event: any): void {
    if (event.target.id === 'refunds-page-id') {
      const routeURL = '/page/refunds';
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

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
