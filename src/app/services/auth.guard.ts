import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(public router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    if (sessionStorage.getItem('token')) {
      setTimeout(() => {
        const role = sessionStorage.getItem('role');
        console.log(role, 'chchchch', route.data);
        if (role) {
          this.router.navigate(['/dashboard']);
          return true;
        } else {
          return false;
        }
      }, 1000);
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
