declare namespace Cypress {
  interface Chainable {
    login(): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add("login", () => {
  cy.session("loginSession", () => {
    cy.visit("/");
    cy.get("[data-test='login-link']").click();

    cy.origin(Cypress.env("AUTH0_BASE_ISSUER_URL"), () => {
      // cy.origin(Cypress.env("AUTH0_BASE_ISSUER_URL"), () => {
      cy.get("#username").type(Cypress.env("TEST_USER_EMAIL"));
      cy.get("button[type=submit]").eq(1).click();

      cy.get("#password").type(Cypress.env("TEST_USER_PASSWORD"));
      cy.get("button[value=default]").eq(0).click();
      cy.on("url:changed", (url) => {
        if (url.search(Cypress.env("AUTH0_BASE_ISSUER_URL")) !== -1) return;
        cy.origin(Cypress.env("AUTH0_BASE_ISSUER_URL"), () => {
          cy.get("html").then(($html) => {
            if ($html.find("button[value='accept']")) {
              cy.wrap($html.find("button[value='accept']")).click();
            }
          });
        });
      });
    });
  });
});
