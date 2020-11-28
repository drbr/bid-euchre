function showErrorAlert(e: unknown, params: { message: string }) {
  console.error(e);
  alert(params.message);
}

export const UIActions = {
  showErrorAlert,
};

export const UIActionNames: { [K in keyof typeof UIActions]: K } = {
  showErrorAlert: 'showErrorAlert',
};
