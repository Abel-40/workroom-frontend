import {reactive,toRefs} from "vue"

const state = reactive({
  isOpen:false
})

export default ()=>{
  const {isOpen} = toRefs(state)

  const onOpen = ()=>{
    document.body.classList.add('overflow-hidden');
    window.scrollTo(0, 0);
    state.isOpen = true
  }
  const onClose = ()=>{
    state.isOpen = false
  }
  return {isOpen,onClose,onOpen}
}