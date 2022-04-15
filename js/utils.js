Star.utils = Star.$u = {
  // Wrap images with fancybox support.
  wrapImageWithFancyBox: function () {
    $('.post img')
      .not(':hidden')
      .each(function () {
        var $img = $(this)
        var imgTitle = $img.attr('title') || $img.attr('alt')
        var $imgWrap = $img.parent('a')
        var imgSource = ['data-src', 'data-original', 'src']
        var imgSrc = ''

        if (!$imgWrap[0]) {
          for (var i = 0; i < imgSource.length; i++) {
            if ($img.attr(imgSource[i])) {
              imgSrc = $img.attr(imgSource[i])
              break
            }
          }
          $imgWrap = $img
            .wrap(`<a class="fancybox" href="${imgSrc}"></a>`)
            .parent('a')
          if ($img.is('.gallery img')) {
            $imgWrap.attr('data-fancybox', 'gallery')
          } else {
            $imgWrap.attr('data-fancybox', 'default')
          }
        }
        if (imgTitle) {
          $imgWrap.attr('title', imgTitle).attr('data-caption', imgTitle)
        }
      })

    $().fancybox({
      selector: '[data-fancybox]',
      loop: true,
      transitionEffect: 'slide',
      hash: false,
      buttons: [
        'share',
        'slideShow',
        'fullScreen',
        'download',
        'thumbs',
        'close'
      ]
    })
  },

  // Init tocbot.
  initTocbot: function () {
    tocbot.init({
      // Where to render the table of contents.
      tocSelector: '.js-toc',
      // Where to grab the headings to build the table of contents.
      contentSelector: '.post-content',
      // Which headings to grab inside of the contentSelector element.
      headingSelector: 'h1, h2, h3, h4',
      // For headings inside relative or absolute positioned containers within content.
      hasInnerContainers: false,
      // orderedList can be set to false to generate unordered lists (ul)
      // instead of ordered lists (ol)
      orderedList: false,
    })
  }
}