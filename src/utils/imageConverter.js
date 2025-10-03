export const convertImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const originalName = file.name;
        const isHeic = /\.(heic|heif)$/i.test(originalName);
        
        if (isHeic) {
          // HEIC dosyaları için basit bir uyarı göster
          // Gerçek HEIC dönüştürme için server-side API gerekli
          reject(new Error("HEIC conversion requires server-side processing. Please use the web version."));
          return;
        }
        
        // Diğer formatlar için Canvas API kullan
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Canvas boyutlarını ayarla
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Resmi canvas'a çiz
          ctx.drawImage(img, 0, 0);
          
          // JPEG olarak export et
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // Dosya adını .jpg ile değiştir
          const name = originalName
            .replace(/\.(png|webp|avif)$/i, ".jpg");
          
          resolve({
            name,
            dataUrl,
          });
        };
        
        img.onerror = () => reject(new Error("Image loading failed"));
        img.src = e.target.result;
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsDataURL(file);
  });
};
