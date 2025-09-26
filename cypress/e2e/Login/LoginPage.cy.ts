/// <reference types="cypress" />
import interceptLogs from "../../helper/google-intercept";
import Login from "../../support/page/index";

describe("Validar Fluxo de Login na aplicação com diferentes cenários", () => {
  
  context("Validando login com: Usuarios e Passords inválidos e falsos, e credenciais válidas", () => {
    beforeEach("Primeira coisa é visitar a tela de login", () => {
      interceptLogs.act();
      cy.login();
    });

    it("Validar fluxo de login com: Credêncial inválida (username)", () => {
      Login.invalidUser();
      cy.get('#flash > b').should('have.text', 'Your username is invalid!')
      cy.screenshot("Username-inválido"); // 👈 Nome do arquivo


    });

    it("Validar fluxo de login com: Credêncial inválida (password)", () => {
      Login.invalidPass();
      cy.get('#flash > b').should('have.text', 'Your password is invalid!')
      cy.screenshot("Password-inválido"); // 👈 Nome do arquivo
    });


    it("Validar fluxo de login com: Credêncial válidas", () => {
      Login.valid();

      cy.get("b").should("have.text", "You logged into a secure area!");
      cy.screenshot("Login-sucesso"); // 👈 Nome do arquivo
    });

  });
});
