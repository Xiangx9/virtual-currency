<template>
  <div class="counter-container">
    <div class="digit-container">
      <template v-for="(char, index) in digits" :key="index">
        <!-- 数字滚动 -->
        <div v-if="isDigit(char)" class="digit">
          <div class="scroll" :style="scrollStyles[index]">
            <div class="number" v-for="n in loopArray" :key="n">{{ n % 10 }}</div>
          </div>
        </div>

        <!-- 非数字（静态显示） -->
        <div v-else class="digit">
          <div class="number">{{ char }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "NumberFlip",
  props: {
    value: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      digits: [],
      scrollStyles: [],
      unitHeight: 40,
      totalRounds: 10,
      loopArray: Array.from({ length: 101 }, (_, i) => i) // 0 ~ 100
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        const str = String(newVal);
        this.digits = str.split("");
        this.$nextTick(() => {
          this.animateScroll();
        });
      }
    }
  },
  methods: {
    isDigit(char) {
      return /^\d$/.test(char);
    },
    animateScroll() {
      this.scrollStyles = this.digits.map((char, i) => {
        if (!this.isDigit(char)) return {};
        const offset = (this.totalRounds + parseInt(char)) * this.unitHeight;
        return {
          top: `-${offset}px`,
          transition: `top 1s ease-out`,
          position: "absolute",
          left: 0
        };
      });
    }
  }
};
</script>

<style scoped>
.counter-container {
  display: flex;
  align-items: center;
  font-size: 28px;
}

.digit-container {
  display: flex;
}

.digit {
  width: 30px;
  height: 40px;
  overflow: hidden;
  position: relative;
  margin: 0 2px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}



.scroll {
  top: 0;
  left: 0;
}

.number {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 32px;
  color: black;
  margin-left: 5px;
}
</style>
