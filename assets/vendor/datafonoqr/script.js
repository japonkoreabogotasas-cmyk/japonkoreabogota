// Detectar cuando la sección entra en el viewport
window.addEventListener("scroll", function() {
    var sections = document.querySelectorAll('.dinamicimages-section');
    
    sections.forEach(function(section) {
      var rect = section.getBoundingClientRect();
      
      // Activar animación cuando la sección es visible
      if (rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0) {
        section.classList.add('visible');
      } else {
        section.classList.remove('visible');
      }
    });
  });
  