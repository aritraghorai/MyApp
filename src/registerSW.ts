// src/registerSW.ts
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content available. Reload to update?')) {
            updateSW(true)
        }
    },
    onOfflineReady() {
        console.log('App ready to work offline')
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
        console.log('Service Worker registered:', registration)
    },
    onRegisterError(error: Error) {
        console.error('Service Worker registration error:', error)
    },
})

export { updateSW }
