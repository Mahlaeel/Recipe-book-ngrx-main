import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { enviroment } from 'src/environments/environment';
import * as AuthActions from './auth.actions';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (
  expiresIn: number,
  email: string,
  userId: string,
  token: string) => {
  const expirationDate = new Date(
    new Date().getTime() + expiresIn * 1000
  );
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expirationDate,
    redirect: true,
  });
};

const handleError = (errorRes: any) => {
  let errorMessage = 'An error occured!';
  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email is already exist';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'This email does not exist';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'This password is not correct';
      break;
  }
  return of(new AuthActions.AuthenticateFail(errorMessage));
};

export const authSignup = createEffect(
  (
    actions$ = inject(Actions),
    http = inject(HttpClient),
    authService = inject(AuthService)
    ) => {
    return actions$.pipe(
      ofType(AuthActions.SIGNUP_START),
      switchMap((signupAction: AuthActions.SignupStart) => {
        return http.post<AuthResponseData>(
          'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
          enviroment.firebaseApiKey,
          {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true
          }
        ).pipe(
          tap(resData => {
            authService.setLogoutTimer(+resData.expiresIn * 1000)
          }),
          map(resData => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError((errorRes) => {
            return handleError(errorRes);
          })
        );
      })
    )
  },
  { functional: true }
);

export const authLogin = createEffect(
  (
    actions$ = inject(Actions),
    http = inject(HttpClient),
    authService = inject(AuthService)
    ) => {
    return actions$.pipe(
      ofType(AuthActions.LOGIN_START),
      switchMap((authData: AuthActions.LoginStart) => {
        return http
          .post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
            enviroment.firebaseApiKey,
            {
              email: authData.payload.email,
              password: authData.payload.password,
              returnSecureToken: true,
            }
          )
          .pipe(
            tap(resData => {
              authService.setLogoutTimer(+resData.expiresIn * 1000);
            }),
            map((resData) => {
              return handleAuthentication(
                +resData.expiresIn,
                resData.email,
                resData.localId,
                resData.idToken
              );
            }),
            catchError((errorRes) => {
              return handleError(errorRes);
            })
          );
      })
    );
  },
  { functional: true }
);

export const authRedirect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(AuthActions.AUTHENTICATE_SUCCESS),
      tap((authSuccessActions: AuthActions.AuthenticateSuccess) => {
        if(authSuccessActions.payload.redirect)
        router.navigate(['/']);
      })
    );
  },
  { functional: true, dispatch: false }
);

export const autoLogin = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.AUTO_LOGIN),
      map(() => {
        const userData: {
          email: string,
          id: string,
          _token: string,
          _tokenExpirationDate: Date
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          return { type: 'DUMMY' };
        }

        const loadedUser = new User(userData.email,
          userData.email,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
          // this.user.next(loadedUser);
          const expiationDuration = new Date(userData._tokenExpirationDate).getTime() -
          new Date().getTime(); // Futur date, the token expiration in milliseconds minus current date in milliseconds.
          authService.setLogoutTimer(expiationDuration);
          return new AuthActions.AuthenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false
          })
          // const expiationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime(); // Futur date, the token expiration in milliseconds minus current date in milliseconds.
          // this.autoLogout(expiationDuration);
        }
        return { type: 'DUMMY' }
      })
    )
  },
  { functional: true }
)

export const authLogout = createEffect(
  (
    actions$ = inject(Actions),
    authService = inject(AuthService),
    router = inject(Router)
    ) => {
    return actions$.pipe(
      ofType(AuthActions.LOGOUT),
      tap(() => {
        authService.clearLogoutTimer();
        localStorage.removeItem('userData');
        router.navigate(['/auth']);
      })
    )
  },
  { functional: true, dispatch: false }
)
