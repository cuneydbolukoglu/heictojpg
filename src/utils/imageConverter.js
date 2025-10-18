export const convertImage = async (file) => {
  console.log("Starting conversion for file:", file.name);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log("File read successfully, starting image processing");
      
      try {
        const originalName = file.name;
        const isHeic = /\.(heic|heif)$/i.test(originalName);
        
        if (isHeic) {
          console.log("HEIC file detected, attempting conversion with Canvas API");
          // HEIC dosyalarını da Canvas ile dönüştürmeyi dene
        }
        
        console.log("Creating image element");
        const img = new Image();
        
        img.onload = () => {
          console.log("Image loaded successfully, creating canvas");
          
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error("Could not get canvas context");
            }
            
            // Canvas boyutlarını ayarla
            canvas.width = img.width;
            canvas.height = img.height;
            
            console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
            
            // Beyaz arka plan ekle (JPEG için)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Resmi canvas'a çiz
            ctx.drawImage(img, 0, 0);
            
            console.log("Image drawn to canvas, converting to JPEG");
            
            // JPEG olarak export et
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // Dosya adını .jpg ile değiştir
            const name = originalName
              .replace(/\.(png|webp|avif)$/i, ".jpg");
            
            console.log(`Successfully converted ${originalName} to ${name}`);
            
            resolve({
              name,
              dataUrl,
            });
          } catch (canvasError) {
            console.error("Canvas conversion failed:", canvasError);
            reject(new Error(`Image conversion failed: ${canvasError.message}`));
          }
        };
        
        img.onerror = (error) => {
          console.error("Image loading failed:", error);
          reject(new Error("Image loading failed. Please try a different file."));
        };
        
        console.log("Setting image source");
        img.src = e.target.result;
        
      } catch (error) {
        console.error("Conversion error:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("File reading failed:", error);
      reject(new Error("File reading failed"));
    };
    
    console.log("Starting file read");
    reader.readAsDataURL(file);
  });
};
