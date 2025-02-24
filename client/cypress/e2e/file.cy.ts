describe("File/folder uploads & deletes", () => {
  const defaultTimeout = 10 * 1000;
  beforeEach(() => {
    cy.login();
    cy.visit("/");
  });

  it("Can upload file via upload file btn and delete file", () => {
    const fileName = "example.json",
      filePath = `cypress/fixtures/${fileName}`;

    // Upload file
    cy.get("[data-test='file-upload-input']").selectFile(filePath, {
      force: true,
    });
    cy.get("[data-test='files-preview-upload-btn']").click();

    // Assert
    cy.get("[data-test='file-item']", { timeout: defaultTimeout })
      .contains(fileName)
      .should("exist");

    // Delete the file
    cy.log("Deleting file");

    cy.get("[data-test='file-item']", { timeout: defaultTimeout })
      .contains(fileName)
      .rightclick();
    cy.get("[data-test='file-item-delete-btn']").click();
    cy.get("[data-test='file-item-confirm-delete-btn']").click();

    // Assert
    cy.get("[data-test='file-item']").should("not.exist");
  });

  it("Can upload file by drag-and-drop and delete file", () => {
    const fileName = "example.json",
      filePath = `cypress/fixtures/${fileName}`;

    // Upload file
    cy.get("[data-test='file-drop-zone-wrapper']").selectFile(filePath, {
      force: true,
      action: "drag-drop",
    });
    cy.get("[data-test='files-preview-upload-btn']").click({ force: true });

    // Assert
    cy.get("[data-test='file-item']", { timeout: defaultTimeout })
      .contains(fileName)
      .should("exist");

    // Delete the file
    cy.log("Deleting file");
    cy.get("[data-test='file-item']", { timeout: defaultTimeout })
      .contains(fileName)
      .rightclick();
    cy.get("[data-test='file-item-delete-btn']").click();
    cy.get("[data-test='file-item-confirm-delete-btn']").click();

    cy.contains(fileName).should("not.exist");
  });

  it("Can create folder and delete folder", () => {
    const folderName = "Test folder";

    // Create
    cy.get("[data-test='right-clickable-area']").rightclick();
    cy.get("[data-test='create-new-folder-btn']").click();
    cy.get("[data-test='new-folder-input']").type(folderName);
    cy.get("[data-test='new-folder-submit']").click();

    // Delete
    cy.get("[data-test='folder-item']", {
      timeout: defaultTimeout,
    }).rightclick();
    cy.get("[data-test='folder-item-delete-btn']").click();
    cy.get("[data-test='file-item-confirm-delete-btn']").click();

    cy.get("[data-test='folder-item']", { timeout: defaultTimeout }).should(
      "not.exist",
    );
  });
});
