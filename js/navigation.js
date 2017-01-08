var Nav = function($) {

    return {

        init: function() {
            this.cacheDom();
            this.setupAria();
            this.bindEvents();
        },

        cacheDom: function() {
            this.$site = $('.site-wrapper');
            this.$navBtn = this.$site.find('[href="#navigation"]');
            this.$navBtnExpanded = this.$site.find('[aria-expanded]');
            this.$nav = $('#navigation');
            this.$navFirstLink = this.$nav.find('li:first-child a');
            this.$navLastLink = this.$nav.find('li:last-child a');
            this.$content = this.$site.find('.content');
        },

        bindEvents: function() {
            this.$navBtn.on('click', this.toggleMenu.bind(this));
            this.$navBtnExpanded.on('keydown', this.setFocus.bind(this));
            this.$navFirstLink.on('keydown', this.returnFocusFirst.bind(this));
            this.$navLastLink.on('keydown', this.returnFocusLast.bind(this));
        },

        setupAria: function() {
            this.$navBtn.attr({
                'role': 'button',
                'aria-controls': 'navigation',
                'aria-expanded': 'false'
            });

            this.$site.attr({
                'data-nav-visible': 'false'
            });
        },

        toggleMenu: function() {
            var self = $(event.currentTarget);
            event.preventDefault();
            self.attr('aria-expanded') === 'true' ? this.closeMenu() : this.openMenu();
        },

        openMenu: function() {
            this.$site.attr({
                'data-nav-visible': 'true'
            });
            this.$navBtn.attr({
                'aria-expanded': 'true'
            });
        },

        closeMenu: function() {
            this.$site.attr({
                'data-nav-visible': 'false'
            });
            this.$navBtn.attr({
                'aria-expanded': 'false'
            });
        },

        returnFocusFirst: function() {
            if (event.keyCode === 9) {
                if (event.shiftKey) {
                    event.preventDefault();
                    this.$navBtn.focus();
                }
            }
        },

        returnFocusLast: function() {
            if (event.keyCode === 9) {
                if (!event.shiftKey) {
                    event.preventDefault();
                    this.$navBtn.focus();
                }
            }
        },

        setFocus: function() {
            var self = $(event.target);
            if (event.keyCode === 9) {
                if (self.attr('aria-expanded') == 'true') {
                    if (!event.shiftKey) {
                        event.preventDefault();
                        this.$navFirstLink.focus();
                    } else {
                        if (event.shiftKey) {
                            event.preventDefault();
                            this.$content.focus();
                        }
                    }
                }
            }
        }
    }

}(jQuery);

Nav.init();