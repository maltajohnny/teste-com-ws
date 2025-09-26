/// <reference types="cypress" />

Cypress.Commands.add("login", () => {
    // Não gerar log customizado
    cy.visit("/login", { log: false });
  });
  