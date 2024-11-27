/* Import Swiper */
import Swiper from "swiper"
import { Autoplay, Pagination, Controller, Scrollbar, EffectFade } from "swiper/modules"

/* Import main CSS */
// import("../css/app.css")

/* Import Alpine.js */
import Alpine from "alpinejs"
import persist from "@alpinejs/persist"

import.meta.glob(["../images/**"])

window.Alpine = Alpine

/* Register GSAP Plugins */
gsap.registerPlugin(Text, ScrollTrigger)

/* Document ready */
document.addEventListener("DOMContentLoaded", () => {
	/* Leafs parallax effect */
	const leafs = gsap.utils.toArray(".leaf")

	gsap.fromTo(
		leafs,
		{
			opacity: 0,
			rotateZ: 90,
			scale: 0,
			filter: "blur(4px)",
		},
		{
			delay: 0.5,
			duration: 2,
			opacity: 0.75,
			rotateZ: 0,
			scale: 1,
			filter: "blur(8px)",
			ease: "back",
		},
	)

	const animateLeafs = () => {
		const x = Math.sin(Date.now() * 0.001) * 0.5
		const y = Math.cos(Date.now() * 0.001) * 0.5

		leafs.forEach((leaf) => {
			const depth = leaf.dataset.depth
			const movementX = x * depth * 100
			const movementY = y * depth * 100

			gsap.to(leaf, {
				x: movementX,
				y: movementY,
				duration: 0.5,
				ease: "power2.out",
			})
		})

		requestAnimationFrame(animateLeafs)
	}

	animateLeafs()

	/* Typing effect */
	const heroesTitleEl = document.querySelector(".heroes-content .title > span")
	const heroesCursorEl = document.querySelector(".heroes-content .title > .cursor")
	const heroesTitleWords = heroesTitleEl.getAttribute("data-words")
	const heroesTitleWordsArr = JSON.parse(`[${heroesTitleWords}]`)
	const heroesTitleTimeline = gsap.timeline({ repeat: -1 })

	if (heroesTitleWordsArr) {
		gsap.to(heroesCursorEl, {
			opacity: 0,
			repeat: -1,
			yoyo: true,
			duration: 0.5,
			ease: "power2.inOut",
		})

		heroesTitleWordsArr.forEach(([word, className]) => {
			let tlText = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 2 })
			tlText.to(".heroes-content .title > span", {
				duration: 1,
				text: {
					value: word,
					newClass: className,
				},
				ease: "none",
			})
			heroesTitleTimeline.add(tlText)
		})
	}

	/* Logos Marquee */
	let gsapMedia = gsap.matchMedia()
	const marquee = document.querySelector(".companies-logos")
	const marqueeContent = marquee.firstElementChild
	const marqueeContentClone = marqueeContent.cloneNode(true)
	marquee.append(marqueeContentClone)

	let tween

	gsapMedia.add(
		{
			isMobile: "(max-width: 719px)",
			isDesktop: "(min-width: 720px)",
		},
		(context) => {
			let { isMobile, isDesktop } = context.conditions

			let progress = tween ? tween.progress() : 0
			tween && tween.progress(0).kill()
			const width = parseInt(getComputedStyle(marqueeContent).getPropertyValue("width"), 10)
			const gap = parseInt(getComputedStyle(marqueeContent).getPropertyValue("columnGap"), 10) || 32
			const distanceToTranslate = -1 * (gap + width)

			tween = gsap.fromTo(marquee.children, { x: 0 }, { x: distanceToTranslate, duration: isMobile ? 15 : 30, ease: "none", repeat: -1 })
			tween.progress(progress)
		},
	)

	/* Circles animation */
	gsap.from("#svg-circles path", {
		yPercent: 15,
		stagger: 0.05,
		autoAlpha: 0,
		duration: 0.75,
		ease: "power1",
		scrollTrigger: {
			trigger: ".advantages",
			start: "top 75%",
		},
	})

	/* Squares animation */
	gsap.from("#svg-squares path", {
		yPercent: 15,
		stagger: 0.05,
		autoAlpha: 0,
		duration: 0.75,
		ease: "power1",
		scrollTrigger: {
			trigger: ".features",
			start: "top center",
		},
	})

	/* Features slider */
	const featuresContentSwiper = new Swiper(".features-content", {
		modules: [EffectFade, Autoplay, Pagination, Controller],
		slidesPerView: 1,
		spaceBetween: 32,
		autoHeight: true,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
			disableOnInteraction: true,
		},
		allowTouchMove: false,
		effect: "fade",
		fadeEffect: {
			crossFade: true,
		},
		pagination: {
			el: ".features-nav",
			type: "bullets",
			clickable: true,
			renderBullet: function (index, className) {
				const autoplayDelay = this?.passedParams?.autoplay?.delay || 0
				const featureTitle = this.slides[index].dataset.featureTitle || ""
				const featureDescr = this.slides[index].dataset.featureDescription || ""

				return `<div class="${className}" style="--animation-duration: ${autoplayDelay}ms">
					<div class="features-nav-item">
						<div class="progress">
							<div class="progress-thumb"></div>
						</div>
						<div class="heading">
							<h5 class="heading-title">${featureTitle}</h5>
							<p class="heading-descr">${featureDescr}</p>
						</div>
					</div>
				</div>`
			},
		},
		on: {
			autoplayPause: function (swiper) {
				swiper.pagination.bullets[swiper.realIndex].classList.add("_is-paused")
			},
			autoplayResume: function (swiper) {
				swiper.pagination.bullets[swiper.realIndex].classList.remove("_is-paused")
			},
			autoplayStop: function (swiper) {
				swiper.pagination.el.classList.add("_is-stopped")
			},
		},
	})

	const featuresTabsSwiper = new Swiper(".features-tabs", {
		modules: [Scrollbar, Controller],
		slidesPerView: 1.3,
		spaceBetween: 16,
		slideToClickedSlide: true,
		scrollbar: {
			el: ".features-tabs-scrollbar",
		},
		grabCursor: true,
		breakpoints: {
			720: {
				slidesPerView: 1.5,
			},
		},
	})

	featuresContentSwiper.controller.control = featuresTabsSwiper
	featuresTabsSwiper.controller.control = featuresContentSwiper

	function isMobile() {
		return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	}

	if (isMobile()) {
		featuresContentSwiper.autoplay.stop()
	} else {
		featuresContentSwiper.autoplay.start()
	}
})

/* Alpine.js */
document.addEventListener("alpine:init", () => {
	Alpine.plugin(persist)

	/* Dark mode */
	Alpine.store("darkMode", {
		dark: Alpine.$persist(false).as("darkMode"),
		init() {
			document.documentElement.classList.toggle("dark", this.dark)
		},
		toggle() {
			this.dark = !this.dark
			document.documentElement.classList.toggle("dark", this.dark)
		},
	})
})

Alpine.start()
