/// <reference types="cypress"/>

class InterceptLogs {
    act() {
        cy.intercept('POST', 'https://www.google-analytics.com/g/collect', { statusCode: 204 });

        cy.intercept(/.*google-analytics\.com.*/, { statusCode: 204 });
        cy.intercept(/.*pagead2\.googlesyndication\.com.*/, { statusCode: 204 });
        cy.intercept(/.*googleads\.g\.doubleclick\.net.*/, { statusCode: 204 });
        cy.intercept(/.*doubleclick\.net.*/, { statusCode: 204 }); // inclui subdomínios
        
    }
}
export default new InterceptLogs()