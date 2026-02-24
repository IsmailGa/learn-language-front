<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/axios';

const route = useRoute();
const status = ref<'loading' | 'success' | 'error'>('loading');
const message = ref('');

onMounted(async () => {
    const token = route.query.token as string;
    
    if (!token) {
        status.value = 'error';
        message.value = 'Invalid verification link.';
        return;
    }
    
    try {
        await api.post(`/v1/auth/verify-email?token=${token}`);
        status.value = 'success';
        message.value = 'Email verified successfully! You can now login.';
    } catch (error: any) {
        status.value = 'error';
        message.value = error.response?.data?.detail || 'Verification failed.';
    }
});
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
            <h2 class="text-2xl font-bold mb-4">Email Verification</h2>
            
            <div v-if="status === 'loading'" class="text-gray-600">
                Verifying your email...
            </div>
            
            <div v-if="status === 'success'" class="text-green-600">
                <p class="mb-4">{{ message }}</p>
                <router-link to="/login" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go to Login
                </router-link>
            </div>
            
            <div v-if="status === 'error'" class="text-red-600">
                <p class="mb-4">{{ message }}</p>
                <router-link to="/login" class="text-blue-600 hover:underline">
                    Back to Login
                </router-link>
            </div>
        </div>
    </div>
</template>
