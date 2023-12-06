declare const plus: any

import router from "../router/router"

document.addEventListener('plusready', function (a) {
    let isBack = false

    router.beforeEach((to, from, next) => {
        if (!isBack) {
            next()
            return
        }
        isBack = false
        if (from.meta.allowQuit) {
            var main = plus.android.runtimeMainActivity();
            main.moveTaskToBack(false);
            next(false)
        }
        next()
    })

    const webview = plus.webview.currentWebview();
    plus.key.addEventListener('backbutton', function () {
        // check if current webview can go back
        if (webview.canBack) {
            isBack = true
            webview.back()
        }
    }, false);
});

export const newSystemNotification = (title: string, content: string) => {
    // check if plus is defined
    if (typeof plus === 'undefined') {
        return
    }
    
    if (!plus) {
        return
    }
    plus.push.createMessage(content, content, {
        title: title,
        cover: true
    })
}

type Position = {
    coords: {
        latitude: number
        longitude: number
        altitude: number
        accuracy: number
        altitudeAccuracy: number
        heading: number
        speed: number
    }
    timestamp: number
}
export const getLocation = () => new Promise<Position>((resolve, reject) => {
    if (!plus) {
        reject('plus is not ready')
        return
    }
    plus.geolocation.getCurrentPosition(
        function (p: Position) {
            resolve(p)
        },
        function (e: any) {
            reject(e)
        }
    )
})

export const scanQRCode = (dom: HTMLElement, onMarked: (typ: any, result: any) => void, onError: (err: any) => void) => {
    var filter = [
        plus.barcode.QR
    ]
    const styles = {
        width: dom.clientWidth + 'px',
        height: dom.clientHeight + 'px',
        position: 'static'
    }
    let scanner: any
    try {
        scanner = plus.barcode.create('scanner', filter, styles, true)
        scanner.onmarked = onMarked
        scanner.onerror = onError
        plus.webview.currentWebview().append(scanner)
        scanner.start()
        return {
            close: () => {
                scanner.close()
                // remove scanner
                plus.webview.currentWebview().remove(scanner)
            }
        }
    } catch (e) {
        if (scanner) {
            scanner.close()
        }
        onError(e)
    }
}