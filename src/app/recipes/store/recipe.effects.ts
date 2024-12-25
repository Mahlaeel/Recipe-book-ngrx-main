import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import * as fromApp from '../../store/app.reducer';
import { Recipe } from "../recipe.model";
import * as RecipesActions from './recipe.actions';


export const fetchRecipes = createEffect(
  (
    actions$ = inject(Actions),
    http = inject(HttpClient),
  ) => {
    return actions$.pipe(
      ofType(RecipesActions.FETCH_RECIPES),
      switchMap
      (
        () => {
          return http.get<Recipe[]>(
            'https://ng-course-recipe-book-33b32-default-rtdb.firebaseio.com/recipes.json'
          );
        }),
        map((recipes: Recipe[]) => {
          return recipes.map((recipe: Recipe) => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
              }),
    map( (recipes: Recipe[]) => {
      return new RecipesActions.SetRecipes(recipes);
    }),
  )},
  { functional: true }
  );

  export const StoreRecipes = createEffect(
    (actions$ = inject(Actions),
    http = inject(HttpClient),
    store = inject(Store<fromApp.AppState>)
    ) => {
      return actions$.pipe(
        ofType(RecipesActions.STORE_RECIPES),
        withLatestFrom(store.select('recipes')),
        switchMap(([actionData, recipesState]) => {
          return http.put(
            'https://ng-course-recipe-book-33b32-default-rtdb.firebaseio.com/recipes.json',
            recipesState.recipes
          );
        })
        )
  },
  {functional: true, dispatch: false}
  );
