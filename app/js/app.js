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
				let rebuildQueued = false
				let lastContainerWidth = 0
				let lastDpr = 0
				let resizeObserver
				let roTimer
				let lastObservedWidth
				const scheduleRebuild = (force = false) => {
					const dpr = window.devicePixelRatio || 1
					const containerWidth = marquee.getBoundingClientRect().width
					if (!force && Math.abs(containerWidth - lastContainerWidth) < 0.5 && dpr === lastDpr) {
						return
					}
					lastContainerWidth = containerWidth
					lastDpr = dpr
					if (rebuildQueued) {
						return
					}
					rebuildQueued = true
					requestAnimationFrame(() => {
						rebuildQueued = false
						rebuild()
					})
				}

				const rebuild = () => {
					tween && tween.progress(0).kill()
					tween = undefined

					while (marquee.children.length > 1) {
						marquee.lastElementChild.remove()
					}

					const baseTrack = marqueeContent
					if (!baseTrack || !originalItems.length || !activeItemIndices.length) {
						baseTrack && (baseTrack.innerHTML = "")
						gsap.set(baseTrack, { x: 0, clearProps: "willChange" })
						return
					}

					let inner = marquee.querySelector(".companies-track-inner")
					if (!inner) {
						inner = document.createElement("div")
						inner.className = "companies-track-inner"
						marquee.append(inner)
					}
					if (baseTrack.parentElement !== inner) {
						inner.append(baseTrack)
					}
					baseTrack.classList.add("companies-track")
					let secondTrack = inner.children[1]
					if (!secondTrack || !secondTrack.classList.contains("companies-track")) {
						secondTrack = baseTrack.cloneNode(false)
						secondTrack.className = "companies-track"
						inner.append(secondTrack)
					}

					const appendActiveItems = (track) => {
						activeItemIndices.forEach((index) => {
							const node = originalItems[index].cloneNode(true)
							if (node && node.dataset) {
								node.dataset.logoIndex = String(index)
							}
							track.append(node)
						})
					}

					marquee.style.removeProperty("--companies-logo-slot-width")
					marquee.style.removeProperty("--companies-loop-duration")
					inner.classList.remove("_is-animated")

					if (prefersReducedMotion.matches) {
						baseTrack.innerHTML = ""
						secondTrack.innerHTML = ""
						appendActiveItems(baseTrack)
						gsap.set(baseTrack, { x: 0, clearProps: "willChange" })
						return
					}

					baseTrack.innerHTML = ""
					appendActiveItems(baseTrack)

					const imgs = Array.from(baseTrack.querySelectorAll("img"))
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
						const pendingImgs = imgs.filter((img) => !img.complete)
						let remaining = pendingImgs.length
						const onImgDone = () => {
							remaining -= 1
							if (remaining <= 0) {
								rebuild()
							}
						}
						const onImgError = (event) => {
							const img = event.currentTarget
							const item = img?.closest?.("[data-logo-index]")
							const indexStr = item?.dataset?.logoIndex
							const index = indexStr != null ? Number(indexStr) : NaN
							if (!Number.isNaN(index)) {
								activeItemIndices = activeItemIndices.filter((i) => i !== index)
							}
							onImgDone()
						}
						pendingImgs.forEach((img) => {
							img.addEventListener("load", onImgDone, { once: true })
							img.addEventListener("error", onImgError, { once: true })
						})
						return
					}
					secondTrack.innerHTML = ""
					appendActiveItems(secondTrack)

					let maxLogoWidth = 0
					for (const item of Array.from(baseTrack.children)) {
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

					const loopDistance = baseTrack.scrollWidth
					if (!loopDistance) {
						return
					}
					const pxPerSecond = isMobile ? 40 : 60
					const durationSeconds = loopDistance / pxPerSecond
					marquee.style.setProperty("--companies-loop-duration", `${durationSeconds}s`)
					inner.classList.remove("_is-animated")
					void inner.offsetWidth
					inner.classList.add("_is-animated")
				}

				scheduleRebuild(true)

				const onLoad = () => scheduleRebuild(true)
				const onResize = () => {
					const dpr = window.devicePixelRatio || 1
					if (dpr !== lastDpr) {
						scheduleRebuild(true)
					}
				}
				const onMotionChange = () => scheduleRebuild(true)
				window.addEventListener("load", onLoad, { once: true })
				window.addEventListener("resize", onResize)
				resizeObserver = new ResizeObserver((entries) => {
					const entry = entries && entries[0]
					const width = entry?.contentRect?.width
					if (typeof width !== "number") {
						return
					}
					if (lastObservedWidth != null && Math.abs(width - lastObservedWidth) < 0.5) {
						return
					}
					lastObservedWidth = width
					roTimer && clearTimeout(roTimer)
					roTimer = setTimeout(() => {
						const containerWidth = marquee.getBoundingClientRect().width
						if (Math.abs(containerWidth - lastContainerWidth) < 5) {
							return
						}
						scheduleRebuild(false)
					}, 150)
				})
				resizeObserver.observe(marquee)
				prefersReducedMotion.addEventListener("change", onMotionChange)

				return () => {
					window.removeEventListener("resize", onResize)
					roTimer && clearTimeout(roTimer)
					resizeObserver && resizeObserver.disconnect()
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
	let featuresContentSwiper
	let featuresTabsSwiper
	let featuresInited = false

	function isMobile() {
		return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	}

	const initFeaturesSwiper = () => {
		if (featuresInited) {
			return
		}
		featuresInited = true

		featuresContentSwiper = new Swiper(".features-content", {
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

		featuresTabsSwiper = new Swiper(".features-tabs", {
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

		if (isMobile()) {
			featuresContentSwiper.autoplay.stop()
		} else {
			featuresContentSwiper.autoplay.start()
		}
	}

	const featuresSection = document.querySelector(".features")
	if (featuresSection) {
		const io = new IntersectionObserver(
			(entries, observer) => {
				const isIntersecting = entries.some((entry) => entry.isIntersecting)
				if (!isIntersecting) {
					return
				}
				observer.disconnect()
				initFeaturesSwiper()
			},
			{ root: null, threshold: 0.01 },
		)
		io.observe(featuresSection)
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
