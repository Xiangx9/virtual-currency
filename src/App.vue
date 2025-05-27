<script setup>
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="in-out">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style scoped lang="scss">
.nav {
  width: 100%;
  height: 50px;
  background-color: var(--bg-color);
  position: sticky;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.fade-enter-from {
  /* 进入时的透明度为0 和 刚开始进入时的原始位置通过active透明度渐渐变为1 */
  opacity: 0;
  transform: translateX(-100%);


}

.fade-enter-to {
  /*定义进入完成后的位置 和 透明度 */
  opacity: 1;
  transform: translateX(0%);
}

.fade-leave-active,
.fade-enter-active {
  transition: all 0.5s ease-out;
}

.fade-leave-from {
  /* 页面离开时一开始的css样式,离开后为leave-to，经过active渐渐透明 */
  opacity: 1;
  transform: translateX(0%);

}

.fade-leave-to {
  /* 这个是离开后的透明度通过下面的active阶段渐渐变为0 */
  opacity: 0;
  transform: translateX(100%);

}
</style>
