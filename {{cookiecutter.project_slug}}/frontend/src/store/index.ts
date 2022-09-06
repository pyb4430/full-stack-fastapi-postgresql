import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";

import { createMainModule } from "./main";
import { State } from "./state";
import { createAdminModule } from "./admin";

Vue.use(Vuex);

export const createStoreOptions = () => ({
  modules: {
    main: createMainModule(),
    admin: createAdminModule(),
  },
});

const storeOptions: StoreOptions<State> = createStoreOptions();

export const store = new Vuex.Store<State>(storeOptions);

export default store;
