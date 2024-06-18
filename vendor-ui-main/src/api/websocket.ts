export const websocket = (url: string) => {
    if (typeof window !== "undefined") {
        try {
            const ws = new WebSocket(url);
            return ws
        } catch(e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
            throw new Error('WebSocket unexpected error')
        }
    } else {
        throw new Error('browser is not available');
    }
}