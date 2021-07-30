import component1 from './component1'
import selfTable from './table'

const components = [
  component1, selfTable
]

function install (Vue) {
  components.map(component => {
    Vue.component(component.name, component)
  })
}
export default {
  install,
  component1,
  selfTable
}
