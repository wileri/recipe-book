import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Ingredient } from '../models/ingredient';
import { Quantity } from '../models/quantity';
import { Recipe } from '../models/recipe';
import { RecipeService } from '../services/recipe.service';
import { getInvalidCharactersErrorMessage, invalidCharactersValidator } from './custom-validators';
import { IngredientDialogResponse } from './ingredient-dialog-response';
import { IngredientDialogComponent } from './ingredient-dialog/ingredient-dialog.component';

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.component.html',
  styleUrls: ['./new-recipe.component.scss']
})
export class NewRecipeComponent implements OnInit {

  recipeForm = new FormGroup({
    name: new FormControl('', [Validators.required, invalidCharactersValidator()]),
    instructions: new FormControl('', [invalidCharactersValidator()])
  });

  ingredients: Ingredient[] = [];

  constructor(private dialog: MatDialog, private recipeService: RecipeService, private router: Router) { }

  ngOnInit(): void {
    let quantity: Quantity = {
      value: 2,
      unit: 'mg'
    }
    let ingredient: Ingredient = {
      name: "Meat",
      quantity: quantity
    }
    this.ingredients.push(ingredient);
  }

  openEditDialog(ingredientToEdit: Ingredient): void {
    const dialogRef = this.dialog.open(IngredientDialogComponent, {
      width: '40rem',
      data: {
        ingredient: ingredientToEdit,
        ingredients: this.ingredients
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        let dialogResponse = response as IngredientDialogResponse;
        if (dialogResponse.shouldBeDeleted) {
          this.ingredients = this.ingredients.filter(i => i !== dialogResponse.ingredient);
        }
        else {
          this.ingredients.push(dialogResponse.ingredient);
        }
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(IngredientDialogComponent, {
      width: '40rem',
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        let dialogResponse = response as IngredientDialogResponse;
        this.ingredients.push(dialogResponse.ingredient);
      }
    });
  }

  async onSubmit() {
    if (!this.recipeForm.valid) {
      this.recipeForm.markAllAsTouched();
      return;
    }
    let recipe: Recipe = {
      id: undefined,
      name: this.recipeForm.value.name,
      instructions: this.recipeForm.value.instructions,
      ingredients: this.ingredients
    }
    let id;
    let createdRecipe: Recipe = await this.recipeService.createRecipe(recipe).toPromise();;
    id = createdRecipe.id;
    this.router.navigate(['/recipes', id]);
  }

  getNameErrorMessage() {
    if (this.recipeForm.controls.name.hasError('required')) {
      return "Name is required"
    }
    if (this.recipeForm.controls.name.hasError('invalidCharacters')) {
      return getInvalidCharactersErrorMessage();
    }
    return "";
  }

  getInstructionsErrorMessage() {
    if (this.recipeForm.controls.instructions.hasError('invalidCharacters')) {
      return getInvalidCharactersErrorMessage();
    }
    return "";
  }

}
