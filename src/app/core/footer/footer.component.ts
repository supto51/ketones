import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  refCode = '';
  selectedCountry = '';
  selectedLanguage = '';
  generalSettings: any = {};
  defaultLanguage = '';
  isEUCountry = false;
  isStaging: boolean;
  productsData: any = {};

  constructor(
    private route: ActivatedRoute,
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private router: Router,
    private sidebarDataService: SidebarDataService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getQueryParams();
    this.getSelectedCountry();
    this.getSelectedLanguage();
  }

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry.subscribe((country: string) => {
      this.selectedCountry = country;

      this.checkEUCountries();
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage.subscribe((language: string) => {
      this.selectedLanguage = language;
      this.translate.use(this.selectedLanguage);

      this.getPages();
    });
  }

  getPages() {
    this.productsDataService.currentProductsData.subscribe(
      (productsData: any) => {
        if (productsData) {
          this.defaultLanguage = productsData.default_lang;
          this.productsData = productsData;

          this.getGeneralSettings(productsData);
        }
      }
    );
  }

  getGeneralSettings(productsData: any) {
    if (productsData) {
      this.generalSettings = productsData.general_settings;
    }
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

  onClickPage(slug: string) {
    const routeURL = '/page/' + slug;
    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  getCurrentYear() {
    return new Date().getFullYear();
  }

  onClickBlog() {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog']);
    } else {
      this.router.navigate([this.selectedCountry.toLowerCase() + '/' + 'blog']);
    }
  }

  onClickResearch() {
    const routeURL = '/research';

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickPromoterFee() {
    const productsSettings = this.productsData.product_settings;

    const promoter = {
      country: this.selectedCountry,
      language: this.selectedLanguage,
      sku: productsSettings.new_promoter_sku,
      price: +productsSettings.new_promoter_price,
    };

    let currentPromoterData = this.dataService.promoterData.value;

    const found = currentPromoterData.some(
      (promoter) =>
        promoter.country === this.selectedCountry &&
        promoter.language === this.selectedLanguage
    );
    if (!found) currentPromoterData.push(promoter);

    setTimeout(() => {
      this.dataService.setPromoterData(currentPromoterData);
      this.sidebarDataService.changeCartStatus(true);
    }, 0);

    localStorage.setItem('Promoter', JSON.stringify(currentPromoterData));

    this.sidebarDataService.changeSidebarName('add-to-cart');
    $('.drawer').drawer('open');
  }

  onClickPromoter() {
    if (this.selectedCountry === 'GB') {
      this.onClickPromoterFee();
    } else {
      const routeURL = '/promoter';

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

  checkEUCountries() {
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
      this.isEUCountry = true;
    } else {
      this.isEUCountry = false;
    }
  }
}
