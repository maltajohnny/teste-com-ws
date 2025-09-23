describe('Validando primeira tela de login com Washington', () => {
   var login = "login.html"
    beforeEach(() => {
        cy.visit(login)
  
});
    

    it('Validando Login Input Com WS| Usuario invalido. Não deve ter acesso', () => {
   cy.get('#nav-main > .level_1 > :nth-child(1) > .first').should('be.visible')
   cy.get(':nth-child(3) > .submenu').should('be.visible')
   cy.get('[name="username"]').type(Cypress.env('nome'))
   cy.get('[name="password"]').type(Cypress.env('password'))
   cy.get('#tl_login_4 > .formbody > .widget-submit > .submit').click()

   cy.get('h1').should('be.visible')

        
    });

    // it('', () => {
        
    // });

    // it('', () => {
        
    // });
});