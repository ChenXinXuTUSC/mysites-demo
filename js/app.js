const { createApp } = Vue;

createApp({
  data() {
    return {
      sites: [],
      theme: 'dark',
      previewMode: false,
      tooltipVisible: false,
      tooltipContent: '',
      tooltipLoading: false,
      tooltipStyle: {},
      readmeCache: {},
      previewSite: null,
      tooltipHideTimer: null
    };
  },

  async mounted() {
    await this.loadSites();
    this.applyTheme();
  },

  methods: {
    async loadSites() {
      try {
        const response = await fetch('sites.json');
        const data = await response.json();
        this.sites = data.sites;
        await this.$nextTick();
        this.initTilt();
      } catch (err) {
        console.error('Failed to load sites.json:', err);
      }
    },

    initTilt() {
      if (typeof VanillaTilt !== 'undefined') {
        this.$nextTick(() => {
          VanillaTilt.init(document.querySelectorAll('.card'), {
            max: 8,
            speed: 500,
            glare: false,
            scale: 1.015,
            perspective: 1000,
            transition: true,
            easing: 'cubic-bezier(.03,.98,.52,.99)'
          });
        });
      }
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme();
      localStorage.setItem('theme', this.theme);
    },

    applyTheme() {
      const saved = localStorage.getItem('theme');
      if (saved) {
        this.theme = saved;
      }
      document.documentElement.setAttribute('data-theme', this.theme);
    },

    togglePreviewMode() {
      this.previewMode = !this.previewMode;
    },

    handleCardClick(site) {
      if (this.previewMode) {
        this.previewSite = site;
      } else {
        window.open(site.path + '/index.html', '_blank');
      }
    },

    handleCardHover(site, event) {
      clearTimeout(this.tooltipHideTimer);
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();

      const isMobile = window.innerWidth <= 768;
      const tooltipWidth = isMobile ? rect.width : 320;
      const gap = 12;

      if (!isMobile) {
        const spaceRight = window.innerWidth - rect.right - gap - 20;
        if (spaceRight >= tooltipWidth) {
          this.tooltipStyle = {
            top: Math.max(12, rect.top) + 'px',
            left: (rect.right + gap) + 'px',
            maxHeight: Math.min(300, window.innerHeight - rect.top - 20) + 'px'
          };
        } else {
          this.tooltipStyle = {
            top: Math.max(12, rect.top) + 'px',
            left: Math.max(12, rect.left - tooltipWidth - gap) + 'px',
            maxHeight: Math.min(300, window.innerHeight - rect.top - 20) + 'px'
          };
        }
      } else {
        this.tooltipStyle = {
          top: (rect.bottom + 8) + 'px',
          left: rect.left + 'px',
          width: rect.width + 'px',
          maxHeight: '200px'
        };
      }

      this.tooltipVisible = true;

      if (this.readmeCache[site.id] !== undefined) {
        this.tooltipContent = this.readmeCache[site.id];
        this.tooltipLoading = false;
      } else {
        this.tooltipLoading = true;
        this.tooltipContent = '';

        fetch(site.path + '/README.md')
          .then(res => {
            if (!res.ok) throw new Error('Not found');
            return res.text();
          })
          .then(text => {
            this.readmeCache[site.id] = text;
            this.tooltipContent = text;
          })
          .catch(() => {
            this.readmeCache[site.id] = '暂无说明文档';
            this.tooltipContent = '暂无说明文档';
          })
          .finally(() => {
            this.tooltipLoading = false;
          });
      }
    },

    handleCardLeave() {
      this.tooltipHideTimer = setTimeout(() => {
        this.tooltipVisible = false;
      }, 250);
    },

    handleTooltipEnter() {
      clearTimeout(this.tooltipHideTimer);
    },

    handleTooltipLeave() {
      clearTimeout(this.tooltipHideTimer);
      this.tooltipVisible = false;
    },

    closePreview() {
      this.previewSite = null;
    }
  }
}).mount('#app');
