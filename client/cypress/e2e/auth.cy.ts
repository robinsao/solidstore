describe("Auth", () => {
  it("Can logout", () => {
    // Login
    cy.login();
    cy.visit("/");

    //
    cy.get("[data-test='profile']").click();
    cy.get("[data-test='logout-btn']").click();

    cy.url().should("be.oneOf", [
      Cypress.config("baseUrl"),
      `${Cypress.config("baseUrl")}/`,
    ]);
  });
});
