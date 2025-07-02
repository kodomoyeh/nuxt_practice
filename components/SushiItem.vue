<template>
  <div class="relative w-32 h-24 border rounded-lg bg-blue-100 overflow-hidden">
    <!-- 左上角 table_area_id -->
    <div class="absolute top-1 left-1 text-sm font-bold">
      {{ table_area_id }}
    </div>

    <!-- 右上角計時條與時間 -->
    <div class="absolute top-1 right-1 flex items-center space-x-1" :class="timerBarClass">
      <div class="h-2 w-12 rounded"></div>

      <div class="text-xs" :class="timerTextClass"  >{{ formattedDuration }}</div>
    </div>

    <!-- 中間圖片 -->
    <img 
      :src="`/${id}.png`" 
      alt="item image" 
      class="mx-auto my-4 w-16 h-12 object-cover"
    />

    <!-- 下方文字 -->
    <div class="absolute bottom-1 left-0 w-full text-center text-xs bg-white bg-opacity-80">
      + {{ item }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  id: string | number
  created_at: string | number | Date
  item: string
  table_area_id: string | number
  item_type: number
}>()

const now = ref(Date.now())
let intervalId: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  // 每秒更新一次 'now' 的值，觸發 computed 重新計算
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  // 組件銷毀時清除計時器，避免 memory leak
  clearInterval(intervalId)
})

const diffSec = computed(() => {
  const created = new Date(props.created_at).getTime()
  
  const diffMs = now.value - created;
  if (diffMs < 0) return 0; // 避免因時間差出現負數
  return Math.floor(diffMs / 1000)

})

const timerTextClass = computed(() => {
  if (diffSec.value > 900) {
    return 'text-white'
  } else if (diffSec.value > 600) {
    return 'text-white'
  } else if (diffSec.value > 300) {
    return 'text-black'
  } else {
    return 'text-black'
  }
})

const timerBarClass = computed(() => {
  if (diffSec.value > 900) {
    return 'bg-black'
  } else if (diffSec.value > 600) {
    return 'bg-red-500'
  } else if (diffSec.value > 300) {
    return 'bg-yellow-300'
  } else {
    return 'bg-green-500'
  }
})

// 計算距離 created_at 的時間
const formattedDuration = computed(() => {
  const minutes = String(Math.floor(diffSec.value / 60)).padStart(2, '0')
  const seconds = String(diffSec.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})
</script>

<style scoped>
</style>
