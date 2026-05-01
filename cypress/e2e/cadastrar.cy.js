describe('HU-001: Cadastrar Assinatura', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('Cadastrar').click();
  });

  it('CA1: displays all form fields', () => {
    cy.contains('Nome do Serviço').should('be.visible');
    cy.contains('Valor (R$)').should('be.visible');
    cy.contains('Periodicidade').should('be.visible');
    cy.contains('Próxima Renovação').should('be.visible');
  });

  it('CA2: rejects invalid value with MSG001', () => {
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Test');
    cy.get('input[type="number"]').first().clear().type('-10');
    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('O valor informado é inválido').should('be.visible');
  });

  it('CA5/CA6: shows modal and creates subscription', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Teste E2E');
    cy.get('input[type="number"]').first().clear().type('29.90');
    cy.get('select').eq(1).select('Mensal');
    cy.get('input[type="date"]').last().type(tomorrow);
    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('Deseja confirmar o cadastro da assinatura Teste E2E').should('be.visible');
    cy.contains('button', 'Confirmar').click();
    cy.contains('Assinatura cadastrada com sucesso.').should('be.visible');
  });

  it('clears form on Cancel', () => {
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Will be cleared');
    cy.contains('button', 'Cancelar').click();
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').should('have.value', '');
  });

  it('shows hint about monthly calculation', () => {
    cy.contains('calcula automaticamente o valor mensal equivalente').should('be.visible');
  });
});
