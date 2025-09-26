/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to visit the login page without logging the visit command.
       * @example cy.login()
       */
      login(): Chainable<void>;
    }
  }
  