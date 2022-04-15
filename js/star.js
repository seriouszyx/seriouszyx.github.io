$(document).ready(function () {
    Star.utils.pjaxReloadBoot = function () {
        if (CONFIG.fancybox) {
            this.wrapImageWithFancyBox()
        }
 
        if (CONFIG.tocbot) {
            this.initTocbot()
        }
    }

    // Initializaiton
    Star.utils.pjaxReloadBoot()
})