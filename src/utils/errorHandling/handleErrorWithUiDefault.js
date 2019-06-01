export default function handleErrorWithUiDefault(err) {
  const stringifiedErr = JSON.stringify(err);
  console.error(stringifiedErr);
  window.alert(stringifiedErr);
};