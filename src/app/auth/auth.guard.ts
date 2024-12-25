import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, take, tap } from "rxjs";
import { AuthService } from "./auth.service";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';

export const AuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const store = inject(Store<fromApp.AppState>);

    return store.select('auth').pipe(
      take(1),
      map(authState => {
        return authState.user;
      }),
      map(user => {
        const isAuth = !!user;
        if (isAuth) {
          return true;
        }
        return router.createUrlTree(['/auth']);
        // return !!user;
    }),
    // tap(isAuth => {
    //   if (!isAuth) {
    //     router.navigate(['/auth']);
    //   }
    // })
    );
}
