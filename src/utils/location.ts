import { getLocation } from "./native"

type Position = {
    coords: {
        latitude: number
        longitude: number
    }
}

function getBrowserLocation(): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      } else {
        reject("浏览器不支持定位功能")
      }
    })
  }

export const getLocationBulk = async () => {
    try {
        const location = await getLocation()
        if(location) {
            return {
                coords: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }
            }
        }
    } catch(e) {
        return await getBrowserLocation()
    }
}