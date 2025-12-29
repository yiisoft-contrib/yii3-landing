/* Import Swiper */
import Swiper from "swiper"
import { Autoplay, Pagination, Controller, Scrollbar, EffectFade } from "swiper/modules"

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
	if (marquee) {
		const marqueeContent = marquee.firstElementChild
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
		const originalItems = Array.from(marqueeContent?.children || []).map((node) => node.cloneNode(true))
		let activeItemIndices = originalItems.map((_, index) => index)
		let tween

		gsapMedia.add(
			{
				isMobile: "(max-width: 719px)",
				isDesktop: "(min-width: 720px)",
			},
			(context) => {
				let { isMobile } = context.conditions

				const rebuild = () => {
					let progress = tween ? tween.progress() : 0
					tween && tween.progress(0).kill()
					tween = undefined

					while (marquee.children.length > 1) {
						marquee.lastElementChild.remove()
					}

					const track = marqueeContent
					if (!track || !originalItems.length || !activeItemIndices.length) {
						track && (track.innerHTML = "")
						gsap.set(track, { x: 0, clearProps: "willChange" })
						return
					}

					const appendActiveItems = () => {
						activeItemIndices.forEach((index) => {
							const node = originalItems[index].cloneNode(true)
							if (node && node.dataset) {
								node.dataset.logoIndex = String(index)
							}
							track.append(node)
						})
					}

					marquee.style.removeProperty("--companies-logo-slot-width")

					if (prefersReducedMotion.matches) {
						track.innerHTML = ""
						appendActiveItems()
						gsap.set(track, { x: 0, clearProps: "willChange" })
						return
					}

					track.innerHTML = ""
					appendActiveItems()

					const imgs = Array.from(track.querySelectorAll("img"))
					const brokenImgs = imgs.filter((img) => img.complete && img.naturalWidth === 0)
					if (brokenImgs.length) {
						brokenImgs.forEach((img) => {
							const item = img?.closest?.("[data-logo-index]")
							const indexStr = item?.dataset?.logoIndex
							const index = indexStr != null ? Number(indexStr) : NaN
							if (!Number.isNaN(index)) {
								activeItemIndices = activeItemIndices.filter((i) => i !== index)
							}
						})
						rebuild()
						return
					}
					const hasUnloadedImages = imgs.some((img) => !img.complete)
					if (hasUnloadedImages) {
						const onImgLoad = () => rebuild()
						const onImgError = (event) => {
							const img = event.currentTarget
							const item = img?.closest?.("[data-logo-index]")
							const indexStr = item?.dataset?.logoIndex
							const index = indexStr != null ? Number(indexStr) : NaN
							if (!Number.isNaN(index)) {
								activeItemIndices = activeItemIndices.filter((i) => i !== index)
							}
							rebuild()
						}
						imgs.forEach((img) => {
							img.addEventListener("load", onImgLoad, { once: true })
							img.addEventListener("error", onImgError, { once: true })
						})
						return
					}
					appendActiveItems()

					let maxLogoWidth = 0
					for (const item of Array.from(track.children)) {
						const img = item.querySelector("img")
						const width = img?.getBoundingClientRect().width || item.getBoundingClientRect().width
						if (width > maxLogoWidth) {
							maxLogoWidth = width
						}
					}
					if (maxLogoWidth) {
						const dpr = window.devicePixelRatio || 1
						const slotWidth = Math.round(maxLogoWidth * dpr) / dpr
						marquee.style.setProperty("--companies-logo-slot-width", `${slotWidth}px`)
					}

					const firstItem = track.children[0]
					const secondSetFirstItem = track.children[originalItems.length]
					const rawLoopDistance =
						secondSetFirstItem && firstItem
							? secondSetFirstItem.offsetLeft - firstItem.offsetLeft
							: track.scrollWidth

					const dpr = window.devicePixelRatio || 1
					const loopDistance = Math.round(rawLoopDistance * dpr) / dpr
					if (!loopDistance) {
						return
					}

					const containerWidth = marquee.getBoundingClientRect().width
					const minTotalWidth = Math.max(loopDistance * 2, containerWidth * 2)
					while (track.scrollWidth < minTotalWidth) {
						originalItems.forEach((node) => track.append(node.cloneNode(true)))
					}

					const wrapX = gsap.utils.wrap(-loopDistance, 0)
					const snapX = gsap.utils.snap(1 / dpr)
					gsap.set(track, { x: 0, force3D: true })
					const pxPerSecond = isMobile ? 40 : 60
					const duration = loopDistance / pxPerSecond

					tween = gsap.to(track, {
						x: `-=${loopDistance}`,
						duration,
						ease: "none",
						invalidateOnRefresh: true,
						repeat: -1,
						modifiers: {
							x: (x) => `${snapX(wrapX(parseFloat(x)))}px`,
						},
					})
					tween.progress(progress)
				}

				rebuild()

				const onLoad = () => rebuild()
				const onResize = () => rebuild()
				const onMotionChange = () => rebuild()
				window.addEventListener("load", onLoad, { once: true })
				window.addEventListener("resize", onResize)
				prefersReducedMotion.addEventListener("change", onMotionChange)

				return () => {
					window.removeEventListener("resize", onResize)
					prefersReducedMotion.removeEventListener("change", onMotionChange)
				}
			},
		)
	}

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
				const featureDescription = this.slides[index].dataset.featureDescription || ""

				return `<div class="${className}" style="--animation-duration: ${autoplayDelay}ms">
					<div class="features-nav-item">
						<div class="progress">
							<div class="progress-thumb"></div>
						</div>
						<div class="heading">
							<h5 class="heading-title">${featureTitle}</h5>
							<p class="heading-descr">${featureDescription}</p>
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
