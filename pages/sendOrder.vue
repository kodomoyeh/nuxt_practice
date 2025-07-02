<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-xl font-bold mb-4">送出訂單</h1>

    <div class="mb-4">
      <label class="block mb-1 font-medium">Item Key (ID)</label>
      <p class="text-sm text-gray-500 mb-2">可用 Item ID: 0 (握壽司), 1 (炸蝦)</p>
      <input
        v-model="itemKey"
        type="text"
        placeholder="輸入 item id"
        class="w-full border rounded p-2"
      />
    </div>

    <button 
      @click="sendOrder"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Send
    </button>

    <div v-if="message" class="mt-4" :class="success ? 'text-green-600' : 'text-red-600'">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

const itemKey = ref('')
const message = ref('')
const success = ref(false)

const supabase = useSupabaseClient()

const items = ['握壽司', '炸蝦']

const sendOrder = async () => {
  if (!itemKey.value) {
    message.value = '請輸入 item id'
    success.value = false
    return
  }

  const itemIndex = parseInt(itemKey.value, 10)

  if (isNaN(itemIndex) || itemIndex < 1 || itemIndex > items.length) {
    message.value = `無效的 item id。請輸入 1 到 ${items.length } 之間的數字。`
    success.value = false
    return
  }

  const selectedItem = items[itemIndex-1]

  const { data, error } = await supabase
    .from('order_list')
    .insert([
      {
        id: itemKey.value,
        item: selectedItem,
        table_area_id: "01",
        item_type: 1,
        created_at: new Date().toISOString(),
      }
    ])

  if (error) {
    console.error(error)
    message.value = '送出失敗: ' + error.message
    success.value = false
  } else {
    message.value = `送出成功！訂單: ${selectedItem}`
    success.value = true
  }
}
</script>

<style scoped>
</style>
