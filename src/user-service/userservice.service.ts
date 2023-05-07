import { Injectable, NgZone } from '@angular/core';
import * as _ from "lodash";
import { GoogleAuthService } from 'ng-gapi';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public static SESSION_STORAGE_KEY: string = 'loggedInUserEmail'; //picture
  public static SESSION_STORAGE_PICTURE: string = 'loggedInUserPicture';
    
  constructor(private googleAuth: GoogleAuthService){ 
  }
  
  public getToken(): string {
      let token: string = sessionStorage.getItem(UserService.SESSION_STORAGE_KEY);
      if (!token) {
          throw new Error("no token set , authentication required");
      }
      return sessionStorage.getItem(UserService.SESSION_STORAGE_KEY);
  }

  public getUserImage(): string {
    let token: string = sessionStorage.getItem(UserService.SESSION_STORAGE_PICTURE);
    if (!token) {
        throw new Error("no picture set , authentication required");
    }
    return sessionStorage.getItem(UserService.SESSION_STORAGE_PICTURE);
}
  
  public signIn(res: any): void {
    console.log('Signed In', res);
    this.signInSuccessHandler(res);
  }
  
  private signInSuccessHandler(res: any) {    
    sessionStorage.setItem(
        UserService.SESSION_STORAGE_KEY, res['email']
    );
    sessionStorage.setItem(
      UserService.SESSION_STORAGE_PICTURE, res['picture']
    );
  }

  public isUserSignedIn(): boolean {
    return !_.isEmpty(sessionStorage.getItem(UserService.SESSION_STORAGE_KEY));
  }

  // public signIn(){
  //   this.auth2.signIn().then(user => {
  //     console.log(user);  
  //     this.subject.next(user)
  //   }).catch(() => {
  //     this.subject.next(null)
  //   });
  // }

  public signOut(){
    if (this.isUserSignedIn) {
      sessionStorage.removeItem(UserService.SESSION_STORAGE_KEY);
    }
  }

  // public observable(): Observable<gapi.auth2.GoogleUser>{
  //   return this.subject.asObservable()
  // }
}
