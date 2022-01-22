import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-access-restricted',
  templateUrl: './access-restricted.component.html',
  styleUrls: ['./access-restricted.component.css'],
})
export class AccessRestrictedComponent implements OnInit, AfterViewInit {
  clientId = '';
  returningUrl = '';
  clientDomain = '';
  discountHeight = 0;

  constructor(
    private renderer: Renderer2,
    private dataService: AppDataService,
    private router: Router
  ) {
    this.returningUrl = environment.returningURL;
    this.clientId = environment.clientID;
    this.clientDomain = environment.clientDomainURL;
  }

  ngOnInit(): void {
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

  login() {
    const redirectRoute: string = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;

    window.location.href = `${
      this.returningUrl
    }connect/authorize?response_type=code&redirect_uri=${
      this.clientDomain
    }/&client_id=${
      this.clientId
    }&scope=openid%20offline_access%20newgen&state=${JSON.stringify(
      redirectRoute
    )}`;
  }
}
