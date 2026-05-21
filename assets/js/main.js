/**
* Template Name: Maxim - v2.1.0
* Template URL: https://bootstrapmade.com/maxim-free-onepage-bootstrap-theme/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
!(function($) {
  "use strict";

  function getTargetFromHash(hash) {
    if (!hash || hash === '#') {
      return null;
    }

    if (hash === '#products' || hash === '#autopartes') {
      var productsSection = document.querySelector('#autopartes');
      var productsGrid = productsSection ? productsSection.querySelector('.grid-fichas-compact') : null;
      return productsGrid || productsSection || document.getElementById(hash.slice(1));
    }

    var target = document.getElementById(hash.slice(1));
    if (target) {
      return target;
    }

    try {
      var queryTarget = document.querySelector(hash);
      if (!queryTarget) {
        return null;
      }

      return queryTarget;
    } catch (err) {
      return null;
    }
  }

  function getTopAlignedScrollTop(target) {
    var top = target.getBoundingClientRect().top + window.pageYOffset;
    var fixedHeader = document.querySelector('.JK_Header');
    if (fixedHeader) {
      top -= Math.ceil(fixedHeader.getBoundingClientRect().height + 6);
    } else if ($('#header').length) {
      top -= $('#header').outerHeight();
    }
    return Math.max(0, Math.round(top));
  }

  function getPortfolioTop() {
    var syncCard = document.querySelector('#autopartes .ficha-sincronizacion');
    if (!syncCard) {
      return null;
    }
    var top = 0;
    var node = syncCard;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    var extraUp = Math.round(window.innerHeight * 0.15);
    return Math.max(0, Math.round(top - extraUp));
  }

  function centerScrollToTarget(target, duration) {
    $('html, body').stop(true).animate({
      scrollTop: getTopAlignedScrollTop(target)
    }, duration || 900, 'easeInOutExpo');
  }

  // Centered scroll for every internal anchor link
  $(document).on('click', 'a[href*="#"]', function(e) {
    if (this.classList && this.classList.contains('jk-nav-scroll')) {
      return;
    }

    var href = this.getAttribute('href');
    if (!href || href === '#' || this.hasAttribute('data-toggle') || this.hasAttribute('data-bs-toggle')) {
      return;
    }

    var isSamePageHash = location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
      location.hostname === this.hostname &&
      href.indexOf('#') !== -1;

    if (!isSamePageHash && href.charAt(0) !== '#') {
      return;
    }

    var hash = this.hash || href.slice(href.indexOf('#'));
    var target = getTargetFromHash(hash);
    if (!target) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    if (hash === '#products' || hash === '#autopartes') {
      var portfolioTop = getPortfolioTop();
      if (portfolioTop !== null) {
        $('html, body').stop(true).animate({
          scrollTop: portfolioTop
        }, 900, 'easeInOutExpo');
      } else {
        centerScrollToTarget(target, 900);
      }
    } else {
      centerScrollToTarget(target, 900);
    }

    if (history.pushState) {
      history.pushState(null, '', hash);
    }

    if ($(this).parents('.nav-menu, .mobile-nav').length) {
      $('.nav-menu .active, .mobile-nav .active').removeClass('active');
      $(this).closest('li').addClass('active');
    }

    if ($('body').hasClass('mobile-nav-active')) {
      $('body').removeClass('mobile-nav-active');
      $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
      $('.mobile-nav-overly').fadeOut();
    }
  });

  // When opening a page with hash, center the destination immediately
  $(window).on('load', function() {
    if (!window.location.hash) {
      return;
    }

    var navManagedHash = '.jk-nav-scroll[href="' + window.location.hash + '"]';
    if (document.querySelector(navManagedHash)) {
      return;
    }

    var target = getTargetFromHash(window.location.hash);
    if (!target) {
      return;
    }
    window.setTimeout(function() {
      if (window.location.hash === '#products' || window.location.hash === '#autopartes') {
        var portfolioTop = getPortfolioTop();
        if (portfolioTop !== null) {
          window.scrollTo(0, portfolioTop);
          return;
        }
      }
      window.scrollTo(0, getTopAlignedScrollTop(target));
    }, 30);
  });

  // Smooth scroll for the navigation menu and links with .scrollto classes
  $(document).on('click', '.nav-menu a, .mobile-nav a, .scrollto', function(e) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      e.preventDefault();
      var target = $(this.hash);
      if (target.length) {

        var scrollto = target.offset().top;
        var scrolled = 0;

        if ($('#header').length) {
          scrollto -= $('#header').outerHeight()

          if (!$('#header').hasClass('header-scrolled')) {
            scrollto += scrolled;
          }
        }

        if ($(this).attr("href") == '#header') {
          scrollto = 0;
        }

        $('html, body').animate({
          scrollTop: scrollto
        }, 2000, 'easeInOutExpo');

        if ($(this).parents('.nav-menu, .mobile-nav').length) {
          $('.nav-menu .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
          $('.mobile-nav-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Mobile Navigation
  if ($('.nav-menu').length) {
    var $mobile_nav = $('.nav-menu').clone().prop({
      class: 'mobile-nav d-lg-none'
    });
    $('body').append($mobile_nav);
    $('body').prepend('<button type="button" class="mobile-nav-toggle d-lg-none"><i class="icofont-navigation-menu"></i></button>');
    $('body').append('<div class="mobile-nav-overly"></div>');

    $(document).on('click', '.mobile-nav-toggle', function(e) {
      $('body').toggleClass('mobile-nav-active');
      $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
      $('.mobile-nav-overly').toggle();
    });

    $(document).on('click', '.mobile-nav .drop-down > a', function(e) {
      e.preventDefault();
      $(this).next().slideToggle(300);
      $(this).parent().toggleClass('active');
    });

    $(document).click(function(e) {
      var container = $(".mobile-nav, .mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
          $('.mobile-nav-overly').fadeOut();
        }
      }
    });
  } else if ($(".mobile-nav, .mobile-nav-toggle").length) {
    $(".mobile-nav, .mobile-nav-toggle").hide();
  }

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.nav-menu, #mobile-nav');
  var main_nav_height = $('#header').outerHeight();

  $(window).on('scroll', function() {
    var cur_pos = $(this).scrollTop() + 10;

    nav_sections.each(function() {
      var top = $(this).offset().top - main_nav_height,
        bottom = top + $(this).outerHeight();

      if (cur_pos >= top && cur_pos <= bottom) {
        if (cur_pos <= bottom) {
          main_nav.find('li').removeClass('active');
        }
        main_nav.find('a[href="#' + $(this).attr('id') + '"]').parent('li').addClass('active');
      }
    });
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });

  $('.back-to-top').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

  // Testimonials carousel (uses the Owl Carousel library)
  $(".testimonials-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 2
      },
      900: {
        items: 3
      }
    }
  });

  // Portfolio isotope/venobox: solo inicializar si los plugins existen
  $(window).on('load', function() {
    if ($.fn.isotope && $('.portfolio-container').length) {
      var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      $('#portfolio-flters li').on('click', function() {
        $("#portfolio-flters li").removeClass('filter-active');
        $(this).addClass('filter-active');

        portfolioIsotope.isotope({
          filter: $(this).data('filter')
        });
      });
    }

    if ($.fn.venobox && $('.venobox').length) {
      $('.venobox').venobox();
    }
  });

  // Initi AOS
  AOS.init({
    duration: 800,
    easing: "ease-in-out"
  });

})(jQuery);
