import { NgModule } from "@angular/core";
import { AuthComponent } from "./auth.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [AuthComponent],
  imports: [
    FormsModule,
    SharedModule,
    RouterModule.forChild([
    {path: '', component: AuthComponent}
    ])
  ]
})
export class AuthModule {}
