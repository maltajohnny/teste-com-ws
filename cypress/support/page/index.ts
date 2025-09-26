/// <reference types="cypress" />

import { LOGINFORM } from "./elements";

const data = {
    
}

 class Login {
    valid() {
        // Valid user
        cy.get(LOGINFORM.usernameInput).type(Cypress.env('username'))
        cy.get(LOGINFORM.passwordInput).type(Cypress.env('password'))
      
        cy.get(LOGINFORM.loginButton).click()
    }
    invalidUser() {
        // Valid user
     
        cy.get(LOGINFORM.passwordInput).type(Cypress.env('password'))
        cy.get(LOGINFORM.invalidUser).type(Cypress.env('invalid_user'))

        cy.get(LOGINFORM.loginButton).click()
    }
    invalidPass() {
        // Valid user
        cy.get(LOGINFORM.usernameInput).type(Cypress.env('username'))
        cy.get(LOGINFORM.invalidPass).type(Cypress.env('invalid_pass'))
        

        

        cy.get(LOGINFORM.loginButton).click()
    }
}

export default new Login()