import selfTable from './src/main.vue'

selfTable.install = function (Vue) {
  Vue.component(selfTable.name, selfTable)
}

export default selfTable
