// Focused end-to-end coverage for the Arduino sensor ingestion endpoint.
describe('POST /api/sensors', () => {
  const base = { deviceId: 'arduino-e2e-02', pH: 7.0, ec: 1.0, temperature: 21.0, humidity: 55 };

  it('returns a success class for a complete payload', () => {
    cy.request({ method: 'POST', url: '/api/sensors', body: base, failOnStatusCode: false })
      .then((res) => {
        expect([200, 201, 202]).to.include(res.status);
      });
  });

  it('returns a client error class for an empty body', () => {
    cy.request({ method: 'POST', url: '/api/sensors', body: {}, failOnStatusCode: false })
      .then((res) => {
        expect(res.status).to.be.at.least(400);
      });
  });
});
