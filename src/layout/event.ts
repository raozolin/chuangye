const listeners = new Map<string, Function[]>()

export const setupScroll = (el?: HTMLElement) => {
    el?.addEventListener('scroll', () => {
        const scrollTop = el.scrollTop
        const scrollHeight = el.scrollHeight
        const clientHeight = el.clientHeight
        if(scrollTop + clientHeight >= scrollHeight - 8) {
            listeners.get('bottom')?.forEach(listener => listener())
        }
    })
}

export const useScroll = ({
    onBottom
}: {
    onBottom: () => void
}) => {
    listeners.set('bottom', [...(listeners.get('bottom') || []), onBottom])
}

export const unuseScroll = ({
    onBottom
}: {
    onBottom: () => void
}) => {
    listeners.set('bottom', (listeners.get('bottom') || []).filter(listener => listener !== onBottom))
}