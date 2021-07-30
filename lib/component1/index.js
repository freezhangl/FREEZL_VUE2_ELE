import component1 from './src/component1.vue'

component1.install = function (Vue) {
  Vue.component(component1.name, component1)
}

export default component1
