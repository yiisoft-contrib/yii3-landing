/* Import main CSS */
import("../css/app.css")

/* Import Alpine.js */
import Alpine from "alpinejs"

import.meta.glob(["../images/**"])

window.Alpine = Alpine

/* Document ready */
document.addEventListener("DOMContentLoaded", () => {})

/* Alpine.js */
document.addEventListener("alpine:init", () => {})

Alpine.start()
