describe('HU-003: Configurar Alertas de Renovação', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('Alertas').click();
    cy.contains('Alertas de Renovação').should('be.visible');
  });

  it('CA2: shows global alert config', () => {
    cy.contains('Alerta Padrão Global').should('be.visible');
    cy.contains('dias antes').should('be.visible');
  });

  it('CA3: validates alert days range (MSG009)', () => {
    cy.get('input[type="number"]').first().clear().type('0');
    cy.contains('A antecedência do alerta deve ser um valor entre 1 e 30 dias.').should('be.visible');
  });

  it('CA4: shows upcoming renewals', () => {
    cy.contains('Próximos Vencimentos').should('be.visible');
    cy.contains('Netflix Premium').should('be.visible');
  });

  it('CA4: excludes cancelled subscriptions', () => {
    cy.contains('HBO Max').should('not.exist');
  });

  it('CA7: saves config with success toast', () => {
    cy.contains('button', 'Salvar Configuração').click();
    cy.contains('Configuração de alerta salva com sucesso.').should('be.visible');
  });

  it('shows timeline section', () => {
    cy.contains('Timeline').should('be.visible');
  });
});
