// src/utils/imageCache.js
export class ImageCache {
  static cache = new Map();
  static CACHE_KEY = 'image-cache';
  static MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async cacheImages(urls) {
    const cached = this.getFromStorage();
    const newCache = { ...cached, timestamp: Date.now() };

    for (const url of urls) {
      if (!cached[url] || this.isExpired(cached.timestamp)) {
        try {
          const blob = await this.downloadImage(url);
          const dataUrl = await this.blobToDataUrl(blob);
          newCache[url] = dataUrl;
        } catch (error) {
          console.warn(`Failed to cache image: ${url}`);
        }
      }
    }

    localStorage.setItem(this.CACHE_KEY, JSON.stringify(newCache));
    return newCache;
  }

  static async downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
  }

  static blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  static getFromStorage() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  static isExpired(timestamp) {
    return Date.now() - timestamp > this.MAX_AGE;
  }
}