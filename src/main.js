// 1. Импортируем стили и библиотеки из node_modules
import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

// 2. Регистрируем плагин в GSAP
gsap.registerPlugin(ScrollTrigger);

// ================= 1. Smooth Scroll & Универсальные Якоря =================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical', smooth: true
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000) });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'), { offset: -50, duration: 1.5 });
    });
});

// ================= 2. Умное поведение Sticky-хедера =================
const headerNode = document.getElementById('site-header');
const footer = document.getElementById('contact');

lenis.on('scroll', (e) => {
    if (e.scroll > 50) {
        headerNode.classList.add('is-scrolled');
    } else {
        headerNode.classList.remove('is-scrolled');
    }

    // Прячем хедер только когда футер реально зашёл во вьюпорт
    // getBoundingClientRect работает корректно даже при pin от ScrollTrigger
    const footerTop = footer.getBoundingClientRect().top;
    const headerBottom = headerNode.offsetHeight;

    if (footerTop <= headerBottom) {
        headerNode.classList.add('is-hidden');
    } else {
        headerNode.classList.remove('is-hidden');
    }
});

// ================= 3. GSAP Interface Animations =================
let isIntroFinished = false;

// Загрузочная анимация для текстов Hero
gsap.fromTo(['.hero-title', '.hero-desc'],
    { y: 30, opacity: 0 },
    {
        y: 0,
        opacity: 1,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5,
        onComplete: () => {
            isIntroFinished = true;
        }
    }
);

// Появление стрелки в Hero
gsap.fromTo('.css-dot', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power4.out', delay: 1.3 });

// Реакция на движение мыши
const heroSection = document.querySelector('.hero');
const heroTitle = document.querySelector('.hero-title');
const heroDesc = document.querySelector('.hero-desc');

heroSection.addEventListener('mousemove', (e) => {
    if (!isIntroFinished) return;

    const targetX = (window.innerWidth / 2 - e.clientX) * 0.015;
    const targetY = (window.innerHeight / 2 - e.clientY) * 0.015;

    gsap.to(heroTitle, { x: targetX, y: targetY, duration: 1.2, ease: "power3.out", overwrite: "auto" });
    gsap.to(heroDesc, { x: targetX * 0.45, y: targetY * 0.45, duration: 1.6, ease: "power3.out", overwrite: "auto" });
});

heroSection.addEventListener('mouseleave', () => {
    if (!isIntroFinished) return;

    gsap.to([heroTitle, heroDesc], {
        x: 0, y: 0, duration: 1.4, ease: "elastic.out(1, 0.5)", overwrite: "auto"
    });
});

// Индивидуальная анимация линий при доскролливании
const linesReveal = document.querySelectorAll('.js-line-reveal');
gsap.set(linesReveal, { width: 0 });

linesReveal.forEach(line => {
    gsap.to(line, {
        width: '100%', duration: 1.5, ease: 'power3.inOut',
        scrollTrigger: {
            trigger: line, start: 'top 92%', toggleActions: 'play none none none'
        }
    });
});

// Анимация заголовков
const gsapHeaders = document.querySelectorAll('.js-gsap-header');
gsapHeaders.forEach(header => {
    const spans = header.querySelectorAll('span');
    gsap.set(spans, { x: -20, opacity: 0 });
    ScrollTrigger.create({
        trigger: header, start: "top 85%",
        onEnter: () => {
            gsap.to(spans, { x: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" });
        }, once: true
    });
});

const imgWrappers = document.querySelectorAll('.img-wrapper');
imgWrappers.forEach((wrapper) => {
    const img = wrapper.querySelector('img');
    gsap.from(img, { scrollTrigger: { trigger: wrapper, start: "top 90%" }, scale: 1.3, duration: 1.5, ease: "power3.out" });

    // Фикс параллакса картинок в карточках: движение от -10% до 10% исключает зазоры
    gsap.fromTo(img,
        { yPercent: -7.5 },
        {
            yPercent: 7.5,
            ease: "none",
            scrollTrigger: {
                trigger: wrapper,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );
});

// ================= 4. НАПРАВЛЕННЫЕ ОТРИСОВКИ ОРАНЖ. ТРЕУГОЛЬНИКОВ =================
document.querySelectorAll('.js-triangle-reveal-left').forEach(mask => {
    gsap.fromTo(mask.querySelector('.corner-triangle'), { x: "101%" }, { x: "0%", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: mask, start: "top 85%" } });
});

document.querySelectorAll('.js-triangle-reveal-left-45').forEach(mask => {
    gsap.fromTo(mask.querySelector('.corner-triangle-45'),
        { x: "45%", y: "190%" },
        { x: "0%", y: "0%", delay: 1.2, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: mask, start: "top 85%" } }
    );
});

document.querySelectorAll('.js-triangle-reveal-right').forEach(mask => {
    gsap.fromTo(mask.querySelector('.corner-triangle'), { x: "-101%" }, { x: "0%", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: mask, start: "top 85%" } });
});

document.querySelectorAll('.js-triangle-reveal-down').forEach(mask => {
    gsap.fromTo(mask.querySelector('div'), { y: "-101%" }, { y: "0%", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: mask, start: "top 85%" } });
});

// ================= 5. PREMIUM PROCESS TIMELINE =================
let mm = gsap.matchMedia();

mm.add("(min-width: 992px)", () => {
    const steps = gsap.utils.toArray(".process-step");

    gsap.set(steps, { xPercent: 120, opacity: 0 });
    gsap.set(steps[0], { xPercent: 0, opacity: 1, filter: "blur(0px)", scale: 1 });
    steps[0].classList.add("is-active");

    const processTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            end: "+=3200", // Дистанция скролла
            pin: true,
            scrub: 1.6,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    function transition(outStep, inStep, direction = 1) {
        const outX = direction > 0 ? -110 : 110;
        const inX = direction > 0 ? 110 : -110;

        processTl
            // OUT
            .to(outStep, { xPercent: outX, opacity: 0.15, filter: "blur(6px)", scale: 0.96, duration: 1.8, ease: "power3.inOut" })
            // IN
            .fromTo(inStep,
                { xPercent: inX, opacity: 0, filter: "blur(10px)", scale: 0.96 },
                { xPercent: 0, opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.8, ease: "power3.out" },
                "<"
            )
            // INNER DEPTH
            .fromTo(inStep.querySelector(".process-content"), { y: 60, opacity: 0.6 }, { y: 0, opacity: 1, duration: 1.4, ease: "power2.out" }, "<0.2")
            // HOLD
            .to({}, { duration: 0.8 })
            .add(() => {
                steps.forEach(step => step.classList.remove("is-active"));
                inStep.classList.add("is-active");
            });
    }

    transition(steps[0], steps[1], 1);
    transition(steps[1], steps[2], -1);
    transition(steps[2], steps[3], 1);

    // Эффект глубины при скроле только на десктопах
    gsap.to('.hero-title-wrapper', {
        scale: 0.8, z: -200, y: -40, ease: 'power2.out',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
    });

    gsap.to('.hero-desc-wrapper', {
        scale: 0.6, z: -200, y: -60, ease: 'power2.out',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
        gsap.to(el, { scrollTrigger: { trigger: el, start: "top 85%" }, y: 0, opacity: 1, duration: 1.2, ease: "power3.out" });
    });
});

// мобильный ресайз для Process слайдов
mm.add("(max-width: 991.98px)", () => {
    // clearProps полностью стирает инлайновые стили, возвращая управление чистому CSS
    gsap.set(".process-step, .process-content", {
        clearProps: "transform,opacity,filter,scale,xPercent,y,opacity"
    });

    // Убираем десктопные маркеры активности, чтобы не ломать мобильное отображение
    document.querySelectorAll(".process-step").forEach(step => {
        step.classList.remove("is-active");
    });
});

// ================= 6. Фильтрация Портфолио в Sidebar =================
const workSection = document.querySelector('.work-section');

if (workSection) {
    const filterItems = workSection.querySelectorAll('.sidebar ul li');
    const cards = workSection.querySelectorAll('.portfolio-list .card');

    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            // Защита от повторного клика по уже активному фильтру
            if (this.classList.contains('active')) return;

            // 1. Переключаем активный класс в меню
            filterItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');

            const filterText = this.textContent.trim().toLowerCase();

            const cardsToShow = [];
            const cardsToHide = [];

            // 2. Поиск совпадений строго по содержимому элементов .tag
            cards.forEach(card => {
                // Собираем все теги внутри текущей карточки
                const cardTags = Array.from(card.querySelectorAll('.tag'))
                    .map(t => t.textContent.trim().toLowerCase());

                let isMatch = false;

                if (filterText === 'все') {
                    isMatch = true;
                } else if (filterText === 'ui/ux и веб-дизайн') {
                    isMatch = cardTags.some(tag =>
                        tag.includes('ui ') || tag.includes('ux ') || tag.includes('web') ||
                        tag === 'ui' || tag === 'ux' ||
                        tag.includes('ui/ux') || tag.includes('веб')
                    );
                } else if (filterText === 'бренд-айдентика') {
                    isMatch = cardTags.some(tag =>
                        tag.includes('brand') || tag.includes('бренд') || tag.includes('лого') || tag.includes('identity') || tag.includes('айдентика')
                    );
                } else if (filterText === 'графический дизайн') {
                    isMatch = cardTags.some(tag => tag.includes('graphic') || tag.includes('графич'));
                } else if (filterText === 'мобильные') {
                    isMatch = cardTags.some(tag => tag.includes('mobile') || tag.includes('мобильн'));
                } else if (filterText === 'ai') {
                    isMatch = cardTags.some(tag =>
                        tag === 'ai' || tag.startsWith('ai ') || tag.startsWith('ai-') || tag.includes(' ai ') || tag.includes(' ai-') || tag.includes('ии')
                    );
                }

                if (isMatch) {
                    cardsToShow.push(card);
                } else {
                    cardsToHide.push(card);
                }
            });

            // 3. Запоминаем позицию скролла до изменений в DOM (через Lenis!)
            const scrollBefore = lenis.animatedScroll;

            // 4. Плавный анимационный переход (GSAP)
            if (cardsToHide.length > 0) {
                gsap.to(cardsToHide, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.3,
                    overwrite: "auto",
                    onComplete: () => {
                        cardsToHide.forEach(c => {
                            c.style.display = 'none';
                            c.style.top = '';
                        });
                        // Восстанавливаем скролл после схлопывания высоты
                        lenis.scrollTo(scrollBefore, { immediate: true, force: true });
                        ScrollTrigger.refresh();
                    }
                });
            }

            // Пересчет лесенки значений top для position: sticky у живых карточек
            cardsToShow.forEach((card, index) => {
                card.style.display = 'flex';
                // Динамически выстраиваем лесенку для карточек
                card.style.top = `${120 + index * 20}px`;
            });

            // Восстанавливаем скролл после показа карточек (если высота изменилась)
            lenis.scrollTo(scrollBefore, { immediate: true, force: true });

            gsap.fromTo(cardsToShow,
                { opacity: 0, scale: 0.98 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power2.out",
                    overwrite: "auto",
                    onComplete: () => {
                        // Пересчитываем ScrollTrigger, чтобы параллакс картинок не ломался
                        ScrollTrigger.refresh();
                        updateTagsOverflow();
                    }
                }
            );
        });
    });

    // ================= 6a. Динамическое сворачивание тегов: макс. 2 строки =================
    function updateTagsOverflow() {
        document.querySelectorAll('.tags-wrapper').forEach(wrapper => {
            if (wrapper.closest('.card')?.style.display === 'none') return;

            const tags = wrapper.querySelectorAll('.tag');
            let toggle = wrapper.querySelector('.tags-toggle');

            // Сброс: показываем все теги
            tags.forEach(t => t.classList.remove('overflow'));
            if (wrapper.classList.contains('expanded')) return;

            if (tags.length < 2) {
                if (toggle) toggle.classList.remove('visible');
                return;
            }

            // Собираем строки по offsetTop
            const rowTops = [...new Set([...tags].map(t => t.offsetTop))].sort((a, b) => a - b);

            if (rowTops.length <= 2) {
                if (toggle) toggle.classList.remove('visible');
                return; // всё влезло в 2 строки
            }

            // Прячем теги с 3‑й строки и дальше
            let hidden = 0;
            tags.forEach(t => {
                if (t.offsetTop >= rowTops[2]) {
                    t.classList.add('overflow');
                    hidden++;
                }
            });

            // Создаём / обновляем тоггл
            if (!toggle) {
                toggle = document.createElement('span');
                toggle.className = 'tags-toggle visible';
                wrapper.appendChild(toggle);
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    wrapper.classList.add('expanded');
                });
            }
            toggle.textContent = `(+${hidden})`;
            toggle.classList.add('visible');

            // Тоггл обязан сидеть во 2‑й строке. Если уехал в 3‑ю — освобождаем место,
            // пряча ещё один тег из 2‑й строки, пока тоггл не встанет на место
            let guard = 0;
            while (toggle.offsetTop >= rowTops[2] && guard < hidden) {
                for (let i = tags.length - 1; i >= 0; i--) {
                    if (!tags[i].classList.contains('overflow') && tags[i].offsetTop === rowTops[1]) {
                        tags[i].classList.add('overflow');
                        hidden++;
                        toggle.textContent = `+${hidden}`;
                        break;
                    }
                }
                guard++;
            }
        });
    }

    updateTagsOverflow();
    window.addEventListener('resize', updateTagsOverflow);

    // Клик вне раскрытого враппера — схлопнуть
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.tags-wrapper.expanded').forEach(w => {
            if (!w.contains(e.target)) w.classList.remove('expanded');
        });
    });
    // После схлопывания — пересчитать переполнение
    document.addEventListener('click', () => setTimeout(updateTagsOverflow, 50));
}

// ================= 7. Organic Particle Swarm (Three.js Глобальный блок) =================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 51;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const PARTICLE_COUNT = 6000; // Повышенная плотность точек для четкого силуэта шеврона
const positions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = [];
const origins = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    const spreadX = 58; const spreadY = 32; const spreadZ = 18;
    const edgeFade = Math.pow(Math.random(), 1.45);

    let x = (Math.random() - 0.5) * spreadX;
    let y = (Math.random() - 0.5) * spreadY;
    let z = (Math.random() - 0.5) * spreadZ;

    x *= 0.55 + edgeFade; y *= 0.65 + edgeFade * 0.7;
    x += Math.sin(y * 0.45) * (Math.random() * 1.2);
    y += Math.cos(x * 0.25) * (Math.random() * 1.1);

    // Центр облака смещён в правую половину под слоган "MEASURABLE"
    x += 4;

    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    origins.push({ x, y, z }); velocities.push({ x: 0, y: 0, z: 0 });
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    color: 0x29a2ff, size: 0.158, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

particles.scale.set(0.7, 0.7, 0.7);
gsap.to(canvas, { opacity: 0.9, duration: 2.5, ease: 'power2.out' });
gsap.to(particles.scale, { x: 1, y: 1, z: 1, duration: 4, ease: 'expo.out' });

const mouseParticles = new THREE.Vector2(9999, 9999);
window.addEventListener('mousemove', (e) => {
    mouseParticles.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseParticles.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('mouseleave', () => { mouseParticles.x = 9999; mouseParticles.y = 9999; });

const raycaster = new THREE.Raycaster();
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const intersectionPoint = new THREE.Vector3();
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    raycaster.setFromCamera(mouseParticles, camera);
    raycaster.ray.intersectPlane(interactionPlane, intersectionPoint);

    const posArray = geometry.attributes.position.array;
    particles.rotation.z = Math.sin(elapsed * 0.05) * 0.08;
    particles.rotation.y = Math.cos(elapsed * 0.08) * 0.05;
    particles.position.y = Math.sin(elapsed * 0.3) * 1.2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        let x = posArray[i3]; let y = posArray[i3 + 1]; let z = posArray[i3 + 2];
        const velocity = velocities[i]; const origin = origins[i];

        const noiseX = Math.sin(elapsed * 0.4 + origin.y * 0.15) * 0.015;
        const noiseY = Math.cos(elapsed * 0.5 + origin.x * 0.12) * 0.015;
        const noiseZ = Math.sin(elapsed * 0.3 + origin.x * 0.08) * 0.03;

        velocity.x += ((origin.x + noiseX) - x) * 0.0028;
        velocity.y += ((origin.y + noiseY) - y) * 0.0028;
        velocity.z += ((origin.z + noiseZ) - z) * 0.0028;

        const dx = x - intersectionPoint.x;
        const dy = y - intersectionPoint.y;

        // Круглая точка взаимодействия
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 11;

        if (dist < radius) {
            const force = (radius - dist) / radius;

            velocity.x += dx * force * 0.018;
            velocity.y += dy * force * 0.018;
            velocity.z += force * 0.04;
        }

        velocity.x *= 0.965; velocity.y *= 0.965; velocity.z *= 0.965;

        x += velocity.x; y += velocity.y; z += velocity.z;
        posArray[i3] = x; posArray[i3 + 1] = y; posArray[i3 + 2] = z;
    }

    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

ScrollTrigger.refresh();