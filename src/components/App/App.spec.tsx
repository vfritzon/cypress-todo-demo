import { initialState, RootState } from "../../app/store";
import { interceptIndefinitely, mount } from "../../spec/spec-helpers";
import { nanoid } from "@reduxjs/toolkit";
import { Todo } from "../../api/client";
import { App } from "./App";

// Simplest possible test to mount component
// Good starting point and documentation on what state/props are required
it("mounts", () => {
  // `cy.intercept` is an easy and powerful way to mock http responses
  cy.intercept("/api/todos", []);

  // `mount` is our "enhanced" version that wraps the component in a store provider
  mount(<App />);

  // Query and assert against user visible content (compared to css classes, ids or DOM structure)
  cy.findByText("Todo Board").should("be.visible");
});

// Can group tests that are similar in some way in `describe`, this also groups them in the Cypress runner in a nice way
// Avoid using it to share setup (through `beforeEach`) since that makes the tests harder to follow and maintain
describe("listing todos", () => {
  it("fetches and lists todos", () => {
    //Arrange
    const todos: Array<Todo> = [
      { id: "1", name: "Brush teeth", status: "todo" },
      { id: "2", name: "Make bed", status: "todo" },
    ];
    // Avoid waiting too long or not long enough by using `interceptIndefinitely`
    const getTodosIntercept = interceptIndefinitely(
      "/api/todos",
      { body: todos },
      "getTodos"
    );

    //Act
    mount(<App />);

    //Assert (AAA)
    cy.findByText("Loading todos...")
      .should("be.visible")
      .then(() => {
        getTodosIntercept.sendResponse();
      });
    // `cy.wait` asserts that interception was called before continuing (will fail if it was not called)
    cy.wait("@getTodos");
    cy.findByText("Brush teeth").should("be.visible");
    cy.findByText("Make bed").should("be.visible");
  });

  it("shows error message when fetch fails", () => {
    // Can force network errors on requests
    cy.intercept("/api/todos", {
      forceNetworkError: true,
    });

    mount(<App />);

    cy.findByText("Oops, something went wrong").should("be.visible");
  });

  // Empty states are often forgotten
  it("shows empty state when there are no items", () => {
    // - `mount` and `createState` methods are helpers to make tests more concise and DRY
    // - Arrange and Act in one line
    mount(<App />, createState({ items: [], fetchStatus: "succeeded" }));

    cy.findByText("Nothing to do yet").should("be.visible");
  });
});

describe("adding todos", () => {
  it("can add", () => {
    // Can modify response based on request
    cy.intercept("POST", "/api/todos", (request) => {
      request.continue((response) => {
        response.send({
          body: { ...JSON.parse(request.body), id: nanoid() },
          delay: 1500,
          statusCode: 201,
        });
      });
    }).as("addTodo");

    mount(<App />, createState({ items: [], fetchStatus: "succeeded" }));

    cy.findByLabelText("New todo:").type("Shower");
    cy.findByRole("button", { name: "Add" }).click();
    cy.findByLabelText("New todo:").should("be.disabled");
    cy.findByRole("button", { name: "Add" }).should("be.disabled");
    // Assert that interception is triggered and that it contains correct data
    cy.wait("@addTodo").then((interception) => {
      // Use types to help keep tests up-to-date (e.g. adding a field to Todo)
      const expected: Omit<Todo, "id"> = { name: "Shower", status: "todo" };
      expect(JSON.parse(interception.request.body)).to.deep.equal(expected);
    });
    cy.findByLabelText("New todo:").should("have.focus");
    cy.focused().type("Pack your bag{enter}");
    cy.wait("@addTodo").then((interception) => {
      const expected: Omit<Todo, "id"> = {
        name: "Pack your bag",
        status: "todo",
      };
      // Many assertions in one test is fine in general (compared to conventional unit tests)
      // Need to use judgement to decide when a test is too long and should be split
      expect(JSON.parse(interception.request.body)).to.deep.equal(expected);
    });
  });

  it("displays error message on network error", () => {
    // Can use preloaded state to initialize in certain state (skipping fetching in this case)
    mount(<App />, createState({ items: [], fetchStatus: "succeeded" }));

    cy.intercept("POST", "/api/todos", { forceNetworkError: true }).as(
      "addTodo"
    );

    cy.findByLabelText("New todo:").type("Shower");
    cy.findByRole("button", { name: "Add" }).click();

    cy.findByText("Oops, something went wrong");
  });

  it("displays error message on 500 response", () => {
    mount(<App />, createState({ items: [], fetchStatus: "succeeded" }));

    cy.intercept({ method: "POST", url: "/api/todos" }, { statusCode: 500 }).as(
      "addTodo"
    );

    cy.findByLabelText("New todo:").type("Shower");
    cy.findByRole("button", { name: "Add" }).click();

    cy.findByText("Oops, something went wrong");
  });
});

function createState(state: Partial<RootState["todos"]> = {}): RootState {
  return {
    ...initialState,
    todos: {
      ...initialState.todos,
      ...state,
    },
  };
}
