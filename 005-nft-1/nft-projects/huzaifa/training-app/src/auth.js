import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { Person } from '@stacks/profile';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export function authenticate(setSelected) {
  showConnect({
    appDetails: {
      name: 'Training-App',
      icon: `${window.location.origin}/logo.svg`,
    },
    redirectTo: '/home',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
    onCancel: () => {
      setSelected(false);
    },
  });
}

export function getUserData() {
  return userSession.loadUserData();
}

export function getPerson() {
  return new Person(getUserData().profile);
}
