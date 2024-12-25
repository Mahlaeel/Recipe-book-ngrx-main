import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import * as fromApp from './store/app.reducer';
import { EffectsModule } from '@ngrx/effects';
import * as authEffects from './auth/store/auth.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { enviroment } from '../environments/environment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import * as recipeEffects from './recipes/store/recipe.effects';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }, provideClientHydration()],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        SharedModule,
        StoreModule.forRoot(fromApp.appReducer),
        EffectsModule.forRoot([authEffects, recipeEffects]),
        StoreDevtoolsModule.instrument({logOnly: enviroment.production}),
        StoreRouterConnectingModule.forRoot(),
    ]
})
export class AppModule { }
