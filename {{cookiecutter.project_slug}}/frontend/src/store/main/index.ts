import { mutations } from "./mutations";
import { getters } from "./getters";
import { actions } from "./actions";
import { MainState } from "./state";

const createDefaultState: () => MainState = () => ({
  isLoggedIn: null,
  token: "",
  logInError: false,
  userProfile: null,
  dashboardMiniDrawer: false,
  dashboardShowDrawer: true,
  notifications: [],
});

export const createMainModule = () => ({
  state: createDefaultState(),
  mutations,
  actions,
  getters,
});
