import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../services/products-data.service';
declare var $: any;

@Component({
  selector: 'app-smartship',
  templateUrl: './smartship.component.html',
  styleUrls: ['./smartship.component.css'],
})
export class SmartshipComponent implements OnInit, AfterViewInit, OnDestroy {
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  defaultLanguage = '';
  isStaging: boolean;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private renderer: Renderer2,
    private translate: TranslateService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private productsDataService: ProductsDataService,
    private router: Router
  ) {
    this.isStaging = environment.isStaging;
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
    const bodyClasses =
      document.getElementById('body-element')?.classList.value;

    if (bodyClasses && !bodyClasses.includes('body-gray')) {
      this.renderer.addClass(document.body, 'body-gray');
    }

    this.renderer.removeClass(document.body, 'extr-padd-btm');

    this.dataService.currentDiscountHeight.subscribe((height: number) => {
      this.discountHeight = height;
    });
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
        this.setRedirectURL();
      })
    );
  }

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;
          }
        }
      )
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  onClickLearnMore() {
    const routeURL = '/smartship/about';

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
