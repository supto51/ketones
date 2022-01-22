import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Blog } from 'src/app/blogs/models/blog.model';

@Injectable({
  providedIn: 'root',
})
export class AppApiService {
  domainPath: string;
  phraseBase: string;
  apiPath = 'wp-json/wp/pruvitnow/products';

  constructor(private http: HttpClient) {
    this.domainPath = environment.domainPath;
    this.phraseBase = environment.phraseBase;
  }

  getReferrer(refCode: string) {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/referrer/?ref_code=' + refCode
    );
  }

  getAuthCheckoutURL(code: string, productSku: string) {
    return this.http.get(
      this.domainPath +
        '/wp-json/wp/pruvitnow/mvauth/?code=' +
        code +
        '&product_sku=' +
        productSku
    );
  }

  getLangJsonData() {
    this.http.get('assets/i18n/data(3).json').subscribe((data: any) => {
      const langData: any = {};
      data.StringList.map((element: any) => {
        const myId = element.id;
        langData['"' + myId + '"'] = element.zhhant;
      });
      console.log(langData);
    });
  }

  shortenURlByBitly(urlBody: any) {
    const headers = {
      Authorization: 'Bearer 67026bd9a413f9c11b1eb0649f53ab8192c60766',
      'Content-Type': 'application/json',
    };
    return this.http.post('https://api-ssl.bitly.com/v4/shorten', urlBody, {
      headers: headers,
    });
  }

  getBitlyGroupUid() {
    const headers = {
      Host: 'api-ssl.bitly.com',
      Authorization: 'Bearer 67026bd9a413f9c11b1eb0649f53ab8192c60766',
      Accept: 'application/json',
    };
    return this.http.get('https://api-ssl.bitly.com/v4/groups', {
      headers: headers,
    });
  }

  getGeoCountryCode() {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/geo-redirection-code/'
    );
  }

  getPhraseLanguages(): Observable<any> {
    return this.http.get(
      this.phraseBase + environment.phraseAppId + '/locales/'
    );
  }

  getPhraseTranslation(langID: string) {
    return this.http
      .get(
        this.phraseBase +
          environment.phraseAppId +
          '/locales/' +
          langID +
          '/download/?file_format=json'
      )
      .pipe(
        map((responseData: any) => {
          const finalData = Object.entries(responseData).map((item: any) => {
            var translationObj: any = {};
            translationObj[item[0]] = item[1].message;
            return translationObj;
          });
          return Object.assign({}, ...finalData);
        })
      );
  }

  getStaticTranslation(langCode: string) {
    if (
      langCode === 'en' ||
      langCode === 'de' ||
      langCode === 'es-es' ||
      langCode === 'es' ||
      langCode === 'it' ||
      langCode === 'pt-pt' ||
      langCode === 'zh-hans' ||
      langCode === 'zh-hant'
    ) {
      return this.http.get(`./assets/i18n/${langCode}.json`);
    } else {
      return this.http.get(`./assets/i18n/en.json`);
    }
  }

  getBlogs(country: string) {
    if (country.toLowerCase() === 'us') {
      return this.http
        .get<any[]>(this.domainPath + '/wp-json/wp/pruvitnow/posts/')
        .pipe(
          map((responseData) => {
            const blogArray: Blog[] = [];

            responseData.forEach((element: any) => {
              blogArray.push({
                id: element.id,
                title: element.title.rendered,
                content: element.content.rendered,
                imageUrl: element.thumb_url,
                slug: element.slug,
                description: element.metadata.blog_meta_description
                  ? element.metadata.blog_meta_description
                  : [''],
                authorId: element.author,
                categoryIds: element.categories,
                tags: element.tags,
              });
            });
            return blogArray;
          })
        );
    } else {
      return this.http
        .get<any[]>(
          this.domainPath +
            '/' +
            country.toLowerCase() +
            '/wp-json/wp/pruvitnow/posts/'
        )
        .pipe(
          map((responseData) => {
            const blogArray: Blog[] = [];

            responseData.forEach((element: any) => {
              blogArray.push({
                id: element.id,
                title: element.title.rendered,
                content: element.content.rendered,
                imageUrl: element.thumb_url,
                slug: element.slug,
                description: element.metadata.blog_meta_description
                  ? element.metadata.blog_meta_description
                  : [''],
                authorId: element.author,
                categoryIds: element.categories,
                tags: element.tags,
              });
            });
            return blogArray;
          })
        );
    }
  }

  readCSVFile(url: string): Observable<number[]> {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
    return this.http.get(url, { headers: headers, responseType: 'text' }).pipe(
      map((res) => {
        return res
          .split('\n')
          .filter((item, index) => index !== 0 && +item !== 0)
          .map((str) => +str);
      })
    );
  }
}
