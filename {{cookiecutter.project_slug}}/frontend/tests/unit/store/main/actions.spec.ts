import { createLocalVue } from "@vue/test-utils";
import "@/plugins/vuetify";
import { flushPromises } from "../../utils";
import {
  dispatchCheckLoggedIn,
  dispatchGetUserProfile,
  dispatchLogIn,
} from "@/store/main/actions";
import { createStoreOptions } from "@/store";
import { api } from "@/api";
import router from "@/router";
import { mocked } from "jest-mock";
import { State } from "@/store/state";

import Vuex, { Store } from "vuex";
import {
  readFirstNotification,
  readIsLoggedIn,
  readLoginError,
  readUserProfile,
} from "@/store/main/getters";
import { commitSetLoggedIn } from "@/store/main/mutations";

const localVue = createLocalVue();

localVue.use(Vuex);

jest.mock("@/api");
const mockedApi = mocked(api, true);
jest.mock("@/router");
const mockedRouter = mocked(router, true);

function mockApiLogIn() {
  mockedApi.getMe.mockResolvedValue({
    data: {
      email: "tree@sdee.cod",
      is_active: true,
      is_superuser: false,
      full_name: "Joe Kloe",
      id: 46,
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  });
}

describe("actions-main", () => {
  let store: Store<State>;

  beforeEach(() => {
    store = new Vuex.Store(createStoreOptions());
  });

  it("performs login action", async () => {
    mockedApi.logInGetToken.mockResolvedValue({
      data: { access_token: "authtoken33" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    mockedApi.getMe.mockResolvedValue({
      data: {
        email: "tree@sdee.cod",
        is_active: true,
        is_superuser: false,
        full_name: "Joe Kloe",
        id: 55,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    mockedRouter.currentRoute = {
      path: "/login",
      hash: "",
      query: {},
      params: {},
      fullPath: "/login",
      matched: [],
      name: null,
      redirectedFrom: undefined,
      meta: undefined,
    };

    expect(readIsLoggedIn(store)).toBeFalsy();
    expect(readLoginError(store)).toBeFalsy();
    expect(readUserProfile(store)).toBeNull();
    expect(readFirstNotification(store)).toBeFalsy();

    dispatchLogIn(store, { username: "anything", password: "nothing" });
    await flushPromises();
    expect(readIsLoggedIn(store)).toBeTruthy();
    expect(readLoginError(store)).toBeFalsy();
    expect(readUserProfile(store)?.id).toBe(55);
    expect(mockedRouter.push.mock.calls[0].length).toBe(1);
    expect(mockedRouter.push.mock.calls[0][0]).toBe("/main");
    expect(readFirstNotification(store)).toEqual({
      content: "Logged in",
      color: "success",
    });
  });

  it("performs get user profile action", async () => {
    mockApiLogIn();

    expect(readUserProfile(store)).toBeNull();

    dispatchGetUserProfile(store);
    await flushPromises();
    expect(readUserProfile(store)?.id).toBe(46);
  });

  it("check logged in action does nothing if logged in", async () => {
    mockedApi.getMe.mockResolvedValue({
      data: {
        email: "tree@sdee.cod",
        is_active: true,
        is_superuser: false,
        full_name: "Joe Kloe",
        id: 46,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    commitSetLoggedIn(store, true);
    const checkState = () => {
      expect(readUserProfile(store)).toBeNull();
      expect(readLoginError(store)).toBeFalsy();
      expect(readUserProfile(store)).toBeNull();
      expect(readFirstNotification(store)).toBeFalsy();
    };
    checkState();

    dispatchCheckLoggedIn(store);
    await flushPromises();
    checkState();
  });

  it("check logged in action logs in if getMe succeeds", async () => {
    mockedApi.getMe.mockResolvedValue({
      data: {
        email: "tree@sdee.cod",
        is_active: true,
        is_superuser: false,
        full_name: "Joe Kloe",
        id: 46,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    expect(readIsLoggedIn(store)).toBeFalsy();
    expect(readUserProfile(store)).toBeNull();
    expect(readLoginError(store)).toBeFalsy();
    expect(readUserProfile(store)).toBeNull();
    expect(readFirstNotification(store)).toBeFalsy();

    dispatchCheckLoggedIn(store);
    await flushPromises();
    expect(readIsLoggedIn(store)).toBeTruthy();
    expect(readLoginError(store)).toBeFalsy();
    expect(readUserProfile(store)?.id).toBe(46);
  });

  it("check logged in action logs out if get user profile fails", async () => {
    mockedApi.getMe.mockRejectedValue({
      data: {
        detail: "All broken",
      },
      status: 403,
      statusText: "FAIL",
      headers: {},
      config: {},
    });

    expect(readIsLoggedIn(store)).toBeFalsy();
    expect(readUserProfile(store)).toBeNull();
    expect(readLoginError(store)).toBeFalsy();
    expect(readUserProfile(store)).toBeNull();
    expect(readFirstNotification(store)).toBeFalsy();

    const checkState = () => {
      expect(readIsLoggedIn(store)).toBeFalsy();
      expect(readUserProfile(store)).toBeNull();
      expect(readLoginError(store)).toBeFalsy();
      expect(readUserProfile(store)).toBeNull();
      expect(readFirstNotification(store)).toBeFalsy();
    };
    checkState();

    dispatchCheckLoggedIn(store);
    await flushPromises();
    checkState();
  });
});
