document.querySelectorAll(".scroll-link-productos").forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const viewportHeight = window.innerHeight;
            const rect = targetElement.getBoundingClientRect();
            const absoluteTop = window.pageYOffset + rect.top;
            const offset = viewportHeight * 0.09; // 10% de la altura de la pantalla
            
            window.scrollTo({
                top: absoluteTop - offset,
                behavior: "smooth"
            }); 
        }
    });
});

document.querySelectorAll(".scroll-link-compras").forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const viewportHeight = window.innerHeight;
            const rect = targetElement.getBoundingClientRect();
            const absoluteTop = window.pageYOffset + rect.top;
            const offset = viewportHeight * 0.1; // 10% de la altura de la pantalla
            
            window.scrollTo({
                top: absoluteTop - offset,
                behavior: "smooth"
            });
        }
    });
});

document.querySelectorAll(".scroll-link-pagos").forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const viewportHeight = window.innerHeight;
            const rect = targetElement.getBoundingClientRect();
            const absoluteTop = window.pageYOffset + rect.top;
            const offset = viewportHeight * 0.19; // 10% de la altura de la pantalla
            
            window.scrollTo({
                top: absoluteTop - offset,
                behavior: "smooth"
            });
        }
    });
});

document.querySelectorAll(".scroll-contact").forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const viewportHeight = window.innerHeight;
            const rect = targetElement.getBoundingClientRect();
            const absoluteTop = window.pageYOffset + rect.top;
            const offset = viewportHeight * 0.072; // 10% de la altura de la pantalla
            
            window.scrollTo({
                top: absoluteTop - offset,
                behavior: "smooth"
            });
        }
    });
});

