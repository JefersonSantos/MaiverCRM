console.log('!!! PURE JS BOOT !!!');
document.body.style.background = 'red';
const root = document.getElementById('root');
if (root) {
  root.innerHTML = '<h1 style="color: white; font-size: 50px;">PURE JS SUCCESS</h1>';
}
window.onload = () => {
  console.log('!!! WINDOW LOADED !!!');
};
