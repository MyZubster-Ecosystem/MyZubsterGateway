// End-to-end smoke tests for the MyZubster Gateway web app + sensor ingestion API.
describe('Gateway web app', () => {
  it('serves the homepage', () => {
    cy.request({ url: '/', failOnStatusCode: false }).then((res) => {
      expect([200, 301, 302, 304]).to.include(res.status);
    });
  });

  it('renders a page body', () => {
    cy.visit('/');
    cy.get('body').should('exist');
  });
});

describe('Arduino sensor ingestion API', () => {
  const validPayload = {
    deviceId: 'arduino-e2e-01',
    pH: 6.8,
    ec: 1.2,
    temperature: 22.5,
    humidity: 60,
  };

  it('accepts a well-formed sensor payload', () => {
    cy.request({ method: 'POST', url: '/api/sensors', body: validPayload, failOnStatusCode: false })
      .then((res) => {
        expect([200, 201, 202]).to.include(res.status);
      });
  });

  it('rejects a malformed sensor payload', () => {
    cy.request({ method: 'POST', url: '/api/sensors', body: { unexpected: true }, failOnStatusCode: false })
      .then((res) => {
        expect(res.status).to.be.at.least(400);
      });
  });
});
