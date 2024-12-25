import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, map, of, switchMap, take } from "rxjs";
import { Recipe } from "./recipe.model";
import * as RecipesActions from '../recipes/store/recipe.actions';
import * as fromApp from '../store/app.reducer';


export const recipeResolver: ResolveFn<Recipe[] | Observable<Recipe[]> | void> =

  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Recipe[] | Observable<Recipe[]> | void => {

    const store = inject(Store<fromApp.AppState>);
    const actions$ = inject(Actions);

    return store.select('recipes').pipe(
      take(1),
      map(recipeState => {
        return recipeState.recipes;
      }),
      switchMap(recipes => {
        if (recipes.length === 0) {
          store.dispatch(new RecipesActions.FetchRecipes());
          return actions$.pipe(
            ofType(RecipesActions.SET_RECIPES),
            take(1)
          );
        } else {
          return of(recipes);
        }
      })
    );
  }
