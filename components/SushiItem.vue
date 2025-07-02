<template>
  <div class="relative w-32 h-24 border rounded-lg bg-blue-100 overflow-hidden">
    <!-- 左上角 table_area_id -->
    <div class="absolute top-1 left-1 text-sm font-bold">
      {{ table_area_id }}
    </div>

    <!-- 右上角計時條與時間 -->
    <div class="absolute top-1 right-1 flex items-center space-x-1">
      <div class="bg-yellow-300 h-2 w-12 rounded"></div>
      <div class="text-xs">{{ formattedDuration }}</div>
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
import { computed, defineProps } from 'vue'

const props = defineProps<{
  id: string | number
  created_at: string | number | Date
  item: string
  table_area_id: string | number
  item_type: number
}>()

// 計算距離 created_at 的時間
const formattedDuration = computed(() => {
  const created = new Date(props.created_at).getTime()
  const now = Date.now()
  const diffMs = now - created
  const diffSec = Math.floor(diffMs / 1000)
  const minutes = String(Math.floor(diffSec / 60)).padStart(2, '0')
  const seconds = String(diffSec % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})
</script>

<style scoped>
</style>
