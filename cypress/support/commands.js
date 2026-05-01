Cypress.Commands.add('login', (email = 'admin@subcontrol.com', password = 'admin123') => {
  cy.visit('/');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.contains('button', 'Entrar').click();
  cy.contains('SubControl').should('be.visible');
  cy.contains('Consultar').should('be.visible');
});
