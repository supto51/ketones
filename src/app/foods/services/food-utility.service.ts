import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FoodCart } from '../models/food-cart.model';
import { Food } from '../models/food.model';

@Injectable()
export class FoodUtilityService {
  clientId = '';
  returningUrl = '';
  clientDomain = '';

  constructor() {
    this.returningUrl = environment.returningURL;
    this.clientId = environment.clientID;
    this.clientDomain = environment.clientDomainURL;
  }

  checkMVUser(): boolean {
    const localFoodUser = localStorage.getItem('MVUser');
    const FoodUser = localFoodUser ? JSON.parse(localFoodUser) : null;

    if (
      FoodUser === null ||
      (FoodUser &&
        Object.keys(FoodUser).length === 0 &&
        FoodUser.constructor === Object)
    ) {
      return false;
    } else {
      const LocalCartStorageValue = localStorage.getItem('CartTime');
      const cartStorageValue = LocalCartStorageValue
        ? JSON.parse(LocalCartStorageValue)
        : null;
      const currentTime = new Date().getTime();

      if (cartStorageValue !== null) {
        const timeDifference = (currentTime - cartStorageValue) / 1000;

        if (timeDifference > FoodUser.token_expire_time) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  redirectToMVLogin(routerUrl: string) {
    const redirectRoute: string = routerUrl.includes('?')
      ? routerUrl.split('?')[0]
      : routerUrl;

    localStorage.removeItem('MVUser');
    localStorage.removeItem('Foods');
    localStorage.removeItem('CheckoutFoods');
    localStorage.removeItem('FoodDelivery');

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

  setVIUser(referrer: string, promptLogin: string, viCode: string) {
    const viUser: any = {};

    viUser.viCode = viCode;
    viUser.referrer = referrer;
    viUser.promptLogin = promptLogin;

    localStorage.setItem('ViUser', JSON.stringify(viUser));
  }

  getShippingDate(
    shippingDate: Date,
    is3Letters?: boolean
  ): {
    dayName: string;
    dayOfTheMonth: string;
    monthName: string;
  } {
    const day = shippingDate.getDay();
    const month = shippingDate.getMonth();
    const date = shippingDate.getDate();

    return {
      dayName: this.getDayOfTheWeekName(day, is3Letters),
      monthName: this.getMonthName(month, is3Letters),
      dayOfTheMonth: this.getDayWithOrdinalSuffix(date),
    };
  }

  getDayOfTheWeekName(dayNumber: number, is3Letters?: boolean) {
    const weekday = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const weekDayIn3Letters = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return is3Letters
      ? weekDayIn3Letters[dayNumber - 1]
      : weekday[dayNumber - 1];
  }

  getMonthName(monthNumber: number, is3Letters?: boolean) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthNames3Lettes = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return is3Letters
      ? monthNames3Lettes[monthNumber]
      : monthNames[monthNumber];
  }

  getDayWithOrdinalSuffix(dayNumber: number) {
    const j = dayNumber % 10,
      k = dayNumber % 100;

    if (j == 1 && k != 11) {
      return dayNumber + 'st';
    }
    if (j == 2 && k != 12) {
      return dayNumber + 'nd';
    }
    if (j == 3 && k != 13) {
      return dayNumber + 'rd';
    }

    return dayNumber + 'th';
  }

  removeDayFromFullDate(date: string) {
    const splitedDate = date.split(',');

    return splitedDate.length > 1 ? splitedDate[1] : '';
  }

  saveFoodToLocalStorage(updatedFood: Food, country: string, language: string) {
    const localFoods = localStorage.getItem('Foods');
    let Foods: FoodCart[] = localFoods ? JSON.parse(localFoods) : null;

    if (!Foods) {
      Foods = [];
    }

    if (Foods.length !== 0) {
      const foodIndex = Foods.findIndex((food: FoodCart) => {
        return (
          food.country === country &&
          food.language === language &&
          food.food.id === updatedFood.id
        );
      });
      if (foodIndex !== -1) {
        Foods[foodIndex].food = updatedFood;
      } else {
        Foods.push({
          country: country,
          language: language,
          food: updatedFood,
        });
      }
    } else {
      Foods.push({
        country: country,
        language: language,
        food: updatedFood,
      });
    }

    if (updatedFood.quantity === 0) {
      Foods = Foods.filter((food: FoodCart) => food.food.id !== updatedFood.id);
    }

    localStorage.setItem('Foods', JSON.stringify(Foods));
  }

  saveFoodsToLocalStorage(
    updatedFoods: Food[],
    country: string,
    language: string
  ) {
    let Foods: FoodCart[] = [];

    updatedFoods.forEach((food) => {
      if (food.quantity !== 0) {
        Foods.push({
          country: country,
          language: language,
          food: food,
        });
      }
    });

    localStorage.setItem('Foods', JSON.stringify(Foods));
  }
}
