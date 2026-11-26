(() => {
  const image = document.querySelector('.coalition-header');
  const overlay = document.querySelector('.title-shimmer');
  if (!image || !overlay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function prepare() {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const width = image.naturalWidth;
    const height = Math.ceil(image.naturalHeight * 0.10);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    if (!ctx) return;
    try {
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, width, height);
      const d = pixels.data;
      let selected = 0;
      for (let p=0; p<d.length; p+=4) {
        const r=d[p], g=d[p+1], b=d[p+2];
        const warm = r-g >= 9 && g-b >= 12 && r-b >= 29 && r >= 100;
        const alpha = warm ? Math.min(1, (r-b-24)/35) * d[p+3] : 0;
        d[p]=d[p+1]=d[p+2]=255;
        d[p+3]=alpha;
        if(alpha>0) selected++;
      }
      if (!selected) return;
      ctx.putImageData(pixels,0,0);
      overlay.style.height = (100*height/image.naturalHeight)+'%';
      const mask = 'url('+canvas.toDataURL('image/png')+')';
      overlay.style.maskImage = mask;
      overlay.style.webkitMaskImage = mask;
      overlay.classList.add('is-ready');
    } catch (error) {
      // The original image remains intact if the enhancement cannot load.
      console.warn('Title shimmer unavailable', error);
    }
  }
  if (image.complete) prepare();
  else image.addEventListener('load', prepare, {once:true});
})();