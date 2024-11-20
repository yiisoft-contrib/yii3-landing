/* Import Swiper */
import Swiper from "swiper"
import { Autoplay, Pagination, Controller, Scrollbar } from "swiper/modules"

/* Import main CSS */
import("../css/app.css")

/* Import Alpine.js */
import Alpine from "alpinejs"
import persist from "@alpinejs/persist"

import.meta.glob(["../images/**"])

window.Alpine = Alpine

/* Document ready */
document.addEventListener("DOMContentLoaded", () => {
	const featuresContentSwiper = new Swiper(".features-content", {
		modules: [Autoplay, Pagination, Controller],
		slidesPerView: 1,
		spaceBetween: 32,
		autoHeight: true,
		// autoplay: {
		// 	delay: 5000,
		// 	pauseOnMouseEnter: true,
		// },
		allowTouchMove: false,
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
