<script setup>
import { createClient } from '@supabase/supabase-js'
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const todos = ref([])

// 初始載入資料
async function getTodos() {
  const { data, error } = await supabase.from('todos').select()

  if (error) {
    console.error('Error fetching todos:', error)
    return
  }

  todos.value = data
}

// 用於儲存 Realtime channel 的變數
let channel = null

onMounted(() => {
  // 1. 頁面載入時，先取得一次所有 todos
  getTodos()

  // 2. 建立一個 Realtime channel 來訂閱 'todos' table 的變更
  channel = supabase
    .channel('todos')
    .on(
      'postgres_changes', // 監聽資料庫變更事件
      { event: '*', schema: 'public', table: 'todos' }, // 過濾條件：所有事件、public schema、todos table
      (payload) => {
        console.log('收到了資料庫變更！', payload)

        // 根據事件類型更新本地的 todos 陣列
        if (payload.eventType === 'INSERT') {
          // 如果是新增資料，將新資料加到陣列最前面
          todos.value.unshift(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          // 如果是更新資料，找到對應的 todo 並替換它
          const index = todos.value.findIndex(todo => todo.id === payload.new.id)
          if (index !== -1) {
            todos.value[index] = payload.new
          }
        } else if (payload.eventType === 'DELETE') {
          // 如果是刪除資料，從陣列中移除它
          todos.value = todos.value.filter(todo => todo.id !== payload.old.id)
        }
      }
    )
    .subscribe() // 開始訂閱
})

onUnmounted(() => {
  // 3. 當元件被銷毀時，移除 channel 訂閱，避免記憶體洩漏
  if (channel) {
    supabase.removeChannel(channel)
  }
})
</script>

<template>
  <h1> TODOs </h1>

  <ul>
    <!-- 請確認你的 'todos' table 裡有 'id' 和 'name' 這兩個欄位 -->
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }}</li>
  </ul>
</template>
