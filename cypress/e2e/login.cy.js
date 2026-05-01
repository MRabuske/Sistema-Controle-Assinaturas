describe('Login', () => {
  beforeEach(() => { cy.visit('/'); });

  it('shows login page by default', () => {
    cy.contains('SubControl').should('be.visible');
    cy.contains('Faça login para continuar').should('be.visible');
  });

  it('logs in with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@subcontrol.com');
    cy.get('input[type="password"]').type('admin123');
    cy.contains('button', 'Entrar').click();
    cy.contains('Consultar Assinaturas').should('be.visible');
  });

  it('shows error for wrong password', () => {
    cy.get('input[type="email"]').type('admin@subcontrol.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.contains('button', 'Entrar').click();
    cy.contains('Email ou senha incorretos').should('be.visible');
  });

  it('toggles to register form', () => {
    cy.contains('Criar conta').click();
    cy.contains('Crie sua conta').should('be.visible');
  });

  it('logs out successfully', () => {
    cy.login();
    cy.contains('button', 'Sair').click();
    cy.contains('Faça login para continuar').should('be.visible');
  });
});
