// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable cypress/no-unnecessary-waiting */
Cypress.Commands.add('uiCreateBoard', (item) => {
    cy.log(`Create new board: ${item}`);

    cy.uiAddBoard('Create new board');
    cy.contains(item).click();
    cy.contains('Use this template').click({force: true}).wait(1000);
});

Cypress.Commands.add('uiCreateEmptyBoard', () => {
    cy.log('Create new empty board');

    cy.uiAddBoard('Create new board');

    cy.contains('Create an empty board').click({force: true}).wait(1000);
});

Cypress.Commands.add('uiAddBoard', (item) => {
    cy.findByRole('button', {name: 'Add Board Dropdown'}).
        should('be.visible').
        click();
    cy.get('.menu-contents').should('be.visible');

    if (item) {
        cy.findByRole('button', {name: item}).click();
    }
});

Cypress.Commands.add('uiCreateNewBoard', (title) => {
    cy.log('**Create new empty board**');
    cy.uiCreateEmptyBoard();

    cy.findByPlaceholderText('Untitled board').should('exist');
    cy.wait(10);
    if (title) {
        cy.log('**Rename board**');
        cy.findByPlaceholderText('Untitled board').type(`${title}{enter}`);
        cy.findByRole('textbox', {name: title}).should('exist');
    }
    cy.wait(500);
});

Cypress.Commands.add('uiAddNewGroup', (name) => {
    cy.log('**Add a new group**');
    cy.findByRole('button', {name: '+ Add a group'}).click();
    cy.findByRole('textbox', {name: 'New group'}).should('exist');

    if (name) {
        cy.log('**Rename group**');
        cy.findByRole('textbox', {name: 'New group'}).type(`{selectall}${name}{enter}`);
        cy.findByRole('textbox', {name}).should('exist');
    }
    cy.wait(500);
});

Cypress.Commands.add('uiAddNewCard', (title, columnIndex) => {
    cy.log('**Add a new card**');
    cy.findByRole('button', {name: '+ New'}).eq(columnIndex || 0).click();
    cy.findByRole('dialog').should('exist');

    if (title) {
        cy.log('**Change card title**');
        cy.findByPlaceholderText('Untitled').type(title);
    }
});
