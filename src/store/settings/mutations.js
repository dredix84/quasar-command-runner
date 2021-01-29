import {LocalStorage} from "quasar";

export const updateExecutionTimeout = (state, value) => {
  if (value >= 0) {
    state.timeout = value;
    LocalStorage.set('timeout', value);
  }
}
export const updateShowResultDialog = (state, value) => {
  state.showResultDialog = value;
  LocalStorage.set('showResultDialog', value);
}
export const updateCompanyName = (state, value) => {
  state.companyName = value;
  LocalStorage.set('companyName', value);
}
export const updateLogo = (state, value) => {
  state.logo = value;
  LocalStorage.set('logo', value);
}

export const restoreDefaults = (state) => {
  let value = LocalStorage.getItem('timeout');
  if (value) {
    state.timeout = value;
  }

  value = LocalStorage.getItem('companyName');
  if (value) {
    state.companyName = value;
  }

  value = LocalStorage.getItem('logo');
  if (value) {
    state.logo = value;
  }

  value = LocalStorage.getItem('showResultDialog');
  state.showResultDialog = !!value;
}

