import {
  Component,
  OnInit,
  HostListener,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { SidebarDataService } from '../../services/sidebar-data.service';
declare var $: any;

@Component({
  selector: 'app-delivery-options',
  templateUrl: './delivery-options.component.html',
  styleUrls: ['./delivery-options.component.css'],
})
export class DeliveryOptionsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  selectedLanguage = '';
  productSettings: any = {};
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private sidebarDataService: SidebarDataService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getDeliveryOptions();
      })
    );
  }

  getDeliveryOptions() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.productSettings = productsData.product_settings;
          }
        }
      )
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  onClickDeliveryOptions() {
    $('.drawer').drawer('close');
    this.sidebarDataService.changeSidebarName('');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
