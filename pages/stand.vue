<script setup>
import { createClient } from '@supabase/supabase-js'
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const todos = ref([])

// 初始載入資料
async function getOrders() {
  const { data, error } = await supabase.from('order_list').select().order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching todos:', error)
    return
  }

  todos.value = data
}

// 用於儲存 Realtime channel 的變數
let channel = null
const wsStatus = ref('connecting') // 'connected' | 'disconnected' | 'connecting'
let wsInstance
onMounted(() => {
  // 1. 頁面載入時，先取得一次所有 todos
  getOrders()

  // 2. 建立一個 Realtime channel 來訂閱 'todos' table 的變更
  channel = supabase
    .channel('order_list')
    .on(
      'postgres_changes', // 監聽資料庫變更事件
      { event: '*', schema: 'public', table: 'order_list' }, // 過濾條件：所有事件、public schema、todos table
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

    //===================
    //const channel0 = supabase.getChannels()[0]

  if (channel) {
    const socket = channel.socket
    wsInstance = socket.conn

    if (wsInstance) {
      wsStatus.value = wsInstance.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'

      wsInstance.addEventListener('open', () => {
        wsStatus.value = 'connected'
      })

      wsInstance.addEventListener('close', () => {
        wsStatus.value = 'disconnected'
      })

      wsInstance.addEventListener('error', () => {
        wsStatus.value = 'disconnected'
      })
    } else {
      wsStatus.value = 'disconnected'
    }
  } else {
    wsStatus.value = 'disconnected'
  }
    //====================
})

onUnmounted(() => {
  // 3. 當元件被銷毀時，移除 channel 訂閱，避免記憶體洩漏
  if (channel) {
    supabase.removeChannel(channel)
  }
})
</script>

<template>
  <h1 class="text-3xl mb-4">站台</h1>
  <span v-if="wsStatus === 'connected'">🟢</span>
    <span v-else>🟥</span>

  <div class=" max-w-3xl mx-auto p-10">  
   <div class="w-2XL grid grid-cols-4 gap-10">
    <!-- 請確認你的 'todos' table 裡有 'id' 和 'name' 這兩個欄位 -->
    

        <SushiItem  v-for="todo in todos" :key="todo.id"
      :id="todo.id"
      :created_at="todo.created_at" 
      :item=" todo.item "
      table_area_id="01"
      :item_type="1"
    />
    
  </div>
  </div>
</template>
