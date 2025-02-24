import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CardDetailComponent } from './components/card-detail/card-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "home", component: HomeComponent},
    {path: "card/:id", component: CardDetailComponent},
    {path: "login", component: LoginComponent},
    {path: "register", component: RegisterComponent, canActivate: [AuthGuard]},
    {path: "**", redirectTo: "login"}
];
