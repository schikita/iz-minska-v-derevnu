        // === Scroll progress bar ===
        const progressEl = document.getElementById('progress');
        const onScroll = () => {
            const h = document.documentElement;
            const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
            progressEl.style.transform = `scaleX(${scrolled})`;
        };
        document.addEventListener('scroll', onScroll, { passive: true });

        // === THREE.js background + fireflies ===
        const ENABLE_HERO_PARTICLES = false;
        const canvas = document.querySelector('#hero-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0.1);
        camera.position.setZ(50);

        // Создаём градиент фон
        const canvas2d = document.createElement('canvas');
        canvas2d.width = 512;
        canvas2d.height = 512;
        const ctx = canvas2d.getContext('2d');
        
        // Красивый градиент неба с сельскими мотивами
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#1a3a52');      // тёмный верх
        gradient.addColorStop(0.3, '#2d5f7d');    // средина
        gradient.addColorStop(0.7, '#4a7c99');    // светлее
        gradient.addColorStop(1, '#6b9db5');      // внизу светло
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Добавим текстуру зёрен
        //for (let i = 0; i < 100; i++) {
            //ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            //ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 2, Math.random() * 2);
       // }

        const bgTexture = new THREE.CanvasTexture(canvas2d);
        // scene.background = bgTexture;

        // Частицы (светлячки)
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCnt = 800;
        const posArray = new Float32Array(particlesCnt * 3);
        const velocities = new Float32Array(particlesCnt * 3);
        const sizes = new Float32Array(particlesCnt);

        for (let i = 0; i < particlesCnt; i++) {
            posArray[i * 3] = (Math.random() - .5) * 200;
            posArray[i * 3 + 1] = (Math.random() - .5) * 200;
            posArray[i * 3 + 2] = (Math.random() - .5) * 100;
            
            velocities[i * 3] = (Math.random() - .5) * .15;
            velocities[i * 3 + 1] = (Math.random() - .5) * .15;
            velocities[i * 3 + 2] = (Math.random() - .5) * .05;
            
            sizes[i] = Math.random() * 0.5 + 0.1;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.3,
            color: 0xffd700,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            const positions = particlesMesh.geometry.attributes.position.array;

            for (let i = 0; i < particlesCnt; i++) {
                positions[i * 3] += velocities[i * 3] * Math.sin(t + i * 0.1);
                positions[i * 3 + 1] += velocities[i * 3 + 1] * Math.cos(t + i * 0.1);
                positions[i * 3 + 2] += velocities[i * 3 + 2] * Math.sin(t + i * 0.05);
                
                // Wrap around
                if (positions[i * 3 + 1] < -100) positions[i * 3 + 1] = 100;
                if (positions[i * 3 + 1] > 100) positions[i * 3 + 1] = -100;
                if (positions[i * 3] > 100) positions[i * 3] = -100;
                if (positions[i * 3] < -100) positions[i * 3] = 100;
            }

            particlesMesh.geometry.attributes.position.needsUpdate = true;
            
            // Плавное движение камеры с мышкой
            camera.position.x += (mouseX / window.innerWidth * 8 - camera.position.x - 4) * .015;
            camera.position.y += (-mouseY / window.innerHeight * 8 - camera.position.y + 4) * .015;
            
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // === IntersectionObserver: reveal ===
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: .16 });

        document.querySelectorAll('.reveal').forEach(el => io.observe(el));

        // === Topbar scroll ===
        const topbar = document.getElementById('topbar');

        function toggleTopbar() {
            if (window.scrollY > 80) topbar.classList.add('topbar--compact');
            else topbar.classList.remove('topbar--compact');
        }

        document.addEventListener('scroll', toggleTopbar, { passive: true });
        toggleTopbar();

 // === Кнопка «Наверх» ===
        const horseUp = document.getElementById('horseUp');

        function toggleHorseUp() {
            if (window.scrollY > 300) horseUp.classList.add('visible');
            else horseUp.classList.remove('visible');
        }

        window.addEventListener('scroll', toggleHorseUp, { passive: true });
        toggleHorseUp();

        horseUp.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        horseUp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });


        // === Мобильное меню ===
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        const navLinks = navMenu.querySelectorAll('.nav-link');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрыть меню при клике на ссылку
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Закрыть меню при скролле
        document.addEventListener('scroll', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }, { passive: true });




// === HERO slideshow (crossfade + Ken Burns) ===
const heroLayers = Array.from(document.querySelectorAll('.hero-bg .layer'));
let heroIdx = 0;

// ждём загрузки картинок, чтобы не мигало
heroLayers.forEach(img => {
  if (img.complete) img.dataset.loaded = "1";
  else img.addEventListener('load', () => img.dataset.loaded = "1");
});

// показать кадр
function showHero(i){
  heroLayers.forEach((el, idx) => el.classList.toggle('active', idx === i));
  heroIdx = i;
}

// старт после первой загруженной
const startHero = () => {
  if (!heroLayers.length) return;
  showHero(0);
  // автопереключение
  setInterval(() => {
    const next = (heroIdx + 1) % heroLayers.length;
    showHero(next);
  }, 6000);
};

// если хотя бы один уже загружен — стартуем сразу, иначе ждём
if (heroLayers.some(el => el.dataset.loaded === "1")) startHero();
else {
  const onAnyLoad = () => {
    if (heroLayers.some(el => el.dataset.loaded === "1")) {
      heroLayers.forEach(el => el.removeEventListener('load', onAnyLoad));
      startHero();
    }
  };
  heroLayers.forEach(el => el.addEventListener('load', onAnyLoad));
}

// === Parallax только для активного слоя ===
document.addEventListener('mousemove', (e) => {
  const active = heroLayers[heroIdx];
  if (!active) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  const speed = parseFloat(active.dataset.speed || '0.3');
  active.style.transform =
    `translate(${x * 18 * speed}px, ${y * 12 * speed}px) scale(1.12)`;
});


document.querySelectorAll(".story-media__video").forEach(block => {
  const video = block.querySelector("video");
  const button = block.querySelector(".play-toggle");

  const togglePlay = () => {
    if (video.paused) {
      video.play();
      button.classList.add("hide"); // скрываем кнопку после старта
    } else {
      video.pause();
      button.classList.remove("hide"); // показываем кнопку снова
    }
  };

  // при клике на кнопку или на само видео
  button.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  // если видео завершилось — снова показываем кнопку
  video.addEventListener("ended", () => button.classList.remove("hide"));
});


const slides = document.querySelectorAll('.photo-slide');
let current = 0;
let timer;

const showSlide = (index) => {
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });
};

const nextSlide = () => {
  current = (current + 1) % slides.length;
  showSlide(current);
};

const prevSlide = () => {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
};

document.querySelector('.slider-btn.next').addEventListener('click', () => {
  nextSlide();
  resetTimer();
});

document.querySelector('.slider-btn.prev').addEventListener('click', () => {
  prevSlide();
  resetTimer();
});

const startAuto = () => timer = setInterval(nextSlide, 8000);
const resetTimer = () => { clearInterval(timer); startAuto(); };

startAuto();


document.querySelectorAll(".photo-slide").forEach(slide => {
  const bg = slide.dataset.bg;
  if (bg) slide.style.backgroundImage = `url('${bg}')`;
});


const mosaicItems = document.querySelectorAll('.mosaic-item');
const modal = document.getElementById('mosaicModal');
const modalImg = document.getElementById('mosaicModalImg');
const caption = document.getElementById('mosaicCaption');
const closeBtn = document.querySelector('.mosaic-close');

mosaicItems.forEach(item => {
  item.addEventListener('click', () => {
    const fullImg = item.dataset.full;
    const alt = item.querySelector('img').alt;

    modal.classList.add('open');
    modalImg.src = fullImg;
    caption.textContent = alt;
    //document.body.style.overflow = 'hidden'; // блокируем скролл
  });
});

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

function closeModal() {
  modal.classList.remove('open');
  //document.body.style.overflow = '';
}


// ========================================
// PROJECTS CAROUSEL
// ========================================
(function () {
    const viewport = document.querySelector('#projects .projects-viewport');
    if (!viewport) return;

    const stage = viewport.querySelector('.projects-stage');
    const cards = [...stage.querySelectorAll('.project-card')];
    if (!cards.length) return;

    const dotsWrap = viewport.querySelector('.pr-dots');
    const prevBtn = viewport.querySelector('.prev');
    const nextBtn = viewport.querySelector('.next');

    let i = 0, timer = null;
    const interval = +(viewport.dataset.interval || 5000);
    const autoplay = viewport.dataset.autoplay !== 'false';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    dotsWrap.innerHTML = cards.map(() => '<i></i>').join('');
    const dots = [...dotsWrap.children];

    const show = (idx) => {
        i = (idx + cards.length) % cards.length;
        cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
        dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    };

    const next = () => show(i + 1);
    const prev = () => show(i - 1);
    const play = () => {
        if (reduce || !autoplay) return;
        stop();
        timer = setInterval(next, interval);
    };
    const stop = () => timer && clearInterval(timer);

    show(0);
    play();

    nextBtn?.addEventListener('click', () => { next(); play(); });
    prevBtn?.addEventListener('click', () => { prev(); play(); });
    dotsWrap.addEventListener('click', (e) => {
        const idx = dots.indexOf(e.target);
        if (idx > -1) { show(idx); play(); }
    });

    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', play);
    viewport.addEventListener('focusin', stop);
    viewport.addEventListener('focusout', play);

    // Swipe support
    let sx = 0, sy = 0;

    stage.addEventListener('pointerdown', (e) => {
        sx = e.clientX;
        sy = e.clientY;
        stage.setPointerCapture(e.pointerId);
        stop();
    });

    stage.addEventListener('pointerup', (e) => {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
            dx > 0 ? prev() : next();
        }
        play();
    });

    // Touch events
    let touchStartX = 0, touchEndX = 0;
    stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stop();
    });

    stage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const dx = touchEndX - touchStartX;
        if (Math.abs(dx) > 40) dx > 0 ? prev() : next();
        play();
    });

    // Auto-pause when out of view
    const io = new IntersectionObserver(([entry]) => {
        entry.isIntersecting ? play() : stop();
    }, { threshold: 0.2 });

    io.observe(viewport);
})();
