import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { FoodApiService } from '../../services/food-api.service';
declare var $: any;

@Component({
  selector: 'app-modal-zip',
  templateUrl: './modal-zip.component.html',
  styleUrls: ['./modal-zip.component.css'],
})
export class ModalZipComponent implements OnInit, OnDestroy {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;
  country = '';
  postalCode = '';
  isPostalAvailable = false;
  promptZipCode = true;
  isZipSubmitted = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private foodApiService: FoodApiService,
    private dataService: AppDataService,
    private productsDataService: ProductsDataService,
    private router: Router
  ) {
    $(document).on('shown.bs.modal', '#userZipModal', () => {
      if (this.zipInput) {
        this.zipInput.nativeElement.focus();
      }
    });
  }

  ngOnInit(): void {
    this.getSelectedCountry();
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe(
        (countryCode: string) => {
          this.country = countryCode;
        }
      )
    );
  }

  checkZipCode() {
    this.isZipSubmitted = true;

    this.subscriptions.push(
      this.foodApiService
        .getZipCode(this.country, this.postalCode)
        .subscribe((status) => {
          this.isZipSubmitted = false;
          this.promptZipCode = false;

          this.isPostalAvailable = status.isAvailable;
        })
    );
  }

  onClickEnterZipCode() {
    this.promptZipCode = true;
  }

  close() {
    this.productsDataService.changePostName('');
    $('#userZipModal').modal('hide');

    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  onClickContinue() {
    this.router.navigate(['/food/select']);

    this.productsDataService.changePostName('');
    $('#userZipModal').modal('hide');

    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
