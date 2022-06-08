import { Provider } from "react-redux";

import { mount as cypressMount } from "cypress/react";

import { initialState, rootReducer, RootState } from "../app/store";
import { configureStore } from "@reduxjs/toolkit";
import {
  RouteMatcher,
  StaticResponse,
  HttpResponseInterceptor,
} from "cypress/types/net-stubbing";

export function mount(
  node: React.ReactNode,
  preloadedState: Partial<RootState> = {}
): ReturnType<typeof cypressMount> {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { ...initialState, ...preloadedState },
  });

  return cypressMount(<Provider store={store}>{node}</Provider>);
}

export function interceptIndefinitely(
  requestMatcher: RouteMatcher,
  response?: StaticResponse | HttpResponseInterceptor,
  as?: string
): { sendResponse: () => void } {
  let sendResponse!: () => void;
  const trigger = new Promise((resolve) => {
    sendResponse = () => resolve(undefined);
  });

  const intercept = cy.intercept(requestMatcher, async (request) => {
    await trigger;
    request.reply(response);
  });

  if (as) {
    intercept.as(as);
  }

  return { sendResponse };
}
