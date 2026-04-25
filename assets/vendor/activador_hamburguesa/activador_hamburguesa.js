const hamburger = document.querySelector('.jk2025_hamburger');
  const menu = document.querySelector('.jk2025_menu');
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
  });