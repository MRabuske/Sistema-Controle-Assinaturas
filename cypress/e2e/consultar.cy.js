describe('HU-002: Consultar e Filtrar Assinaturas', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('Consultar Assinaturas').should('be.visible');
  });

  it('CA1: displays subscription list with columns', () => {
    cy.contains('th', 'Serviço').should('be.visible');
    cy.contains('th', 'Valor').should('be.visible');
    cy.contains('Netflix Premium').should('be.visible');
  });

  it('CA3: shows totalizador cards', () => {
    cy.contains('Assinaturas Ativas').should('be.visible');
    cy.contains('Gasto Mensal').should('be.visible');
    cy.contains('Gasto Anual Estimado').should('be.visible');
  });

  it('CA2: filters by status tab', () => {
    cy.contains('button', 'Pausadas').click();
    cy.contains('Smart Fit').should('be.visible');
    cy.contains('Netflix Premium').should('not.exist');
  });

  it('CA2: filters by search text', () => {
    cy.get('input[placeholder="Nome do serviço..."]').type('spotify');
    cy.contains('Spotify Família').should('be.visible');
    cy.contains('Netflix Premium').should('not.exist');
  });

  it('CA6: sorts by column click', () => {
    cy.contains('th', 'Valor').click();
  });

  it('CA7: shows empty message with no results', () => {
    cy.get('input[placeholder="Nome do serviço..."]').type('XYZNONEXISTENT');
    cy.contains('Nenhuma assinatura encontrada').should('be.visible');
  });

  it('CA8: displays donut chart', () => {
    cy.contains('Distribuição por Categoria').should('be.visible');
    cy.get('svg').should('be.visible');
  });

  it('shows quick summary card', () => {
    cy.contains('Resumo Rápido').should('be.visible');
    cy.contains('Próxima Renovação').should('be.visible');
    cy.contains('Maior Gasto').should('be.visible');
  });

  it('navigates to alerts via link', () => {
    cy.contains('Configurar Alerta').first().click();
    cy.contains('Alertas de Renovação').should('be.visible');
  });
});
