import { defineConfig } from '#q-app'

export default defineConfig(() => {
  return {
    boot: ['pinia', 'axios', 'auth'],

    css: ['app.scss'],

    extras: [
      'material-icons'
    ],

    build: {
      target: {},

      vueRouterMode: 'history'
    },

    devServer: {
      open: true
    },

    framework: {
      config: {
        notify: {
          position: 'top',
          timeout: 2500,
          progress: true
        },
        loading: {
          spinner: 'QSpinnerDots',
          spinnerColor: 'primary',
          message: 'กำลังโหลด...'
        }
      },

      lang: 'th',

      plugins: ['Notify', 'Loading', 'Dialog']
    },

    animations: []
  }
})
