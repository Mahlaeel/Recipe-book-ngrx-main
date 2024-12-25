import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css'],
  // providers: [RecipeService]
  // we face an issue that when we add new recipe and navigate away (like navigate to shopping list, the new recipe is gone)
  //That is because we provide our recipe service in the recipe component
  //So all this components in this area share the same instance
  //But if we navigate away to shopping list area, the recipe component is destroyed and so the instance of the service
  //So what we need to do to ensure our service survives is we need to add it in our app module
  //Or add {providedIn: root} to our service
})
export class RecipesComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

}
