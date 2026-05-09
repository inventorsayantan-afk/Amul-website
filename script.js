const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");
const loader = document.getElementById("loader");
const progressText = document.getElementById("progress");
const mainContent = document.getElementById("main-content");

const frameCount = 240;
const currentFrame = index => (
  `./frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const images = [];
let loadedImages = 0;

// Set initial canvas dimensions
canvas.width = 1920;
canvas.height = 1080;

// Preload Images
const preloadImages = () => {
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      loadedImages++;
      const percent = Math.floor((loadedImages / frameCount) * 100);
      progressText.innerText = `${percent}%`;

      // If it's the first image, draw it immediately so it's not empty
      if (i === 1) {
        img.onload = () => context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      if (loadedImages === frameCount) {
        init();
      }
    };
    images.push(img);
  }
};

const drawImageProp = (ctx, img) => {
    // scale to fit the canvas proportionally
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
};

const init = () => {
  // Hide loader, show main content
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
    mainContent.style.display = 'block';
    
    // Draw first frame
    if (images[0]) {
      drawImageProp(context, images[0]);
    }
  }, 500);

  // Scroll Event Listener
  window.addEventListener('scroll', () => {  
    const scrollTop = html.scrollTop;
    const scrollContainer = document.querySelector('.scroll-container');
    // max scrollable height within the scroll container
    const maxScrollTop = scrollContainer.scrollHeight - window.innerHeight;
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScrollTop));
    
    // Fade out hero text by 30% scroll
    const heroText = document.getElementById('hero-text-overlay');
    if (heroText) {
      if (scrollFraction <= 0.3) {
        // Map 0 -> 0.3 to opacity 1 -> 0
        const opacity = 1 - (scrollFraction / 0.3);
        heroText.style.opacity = Math.max(0, opacity).toString();
      } else {
        heroText.style.opacity = '0';
      }
    }
    
    // calculate frame index based on scroll
    const frameIndex = Math.min(
      frameCount - 1,
      Math.ceil(scrollFraction * frameCount)
    );
    
    requestAnimationFrame(() => updateImage(frameIndex));
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    const scrollTop = html.scrollTop;
    const scrollContainer = document.querySelector('.scroll-container');
    const maxScrollTop = scrollContainer.scrollHeight - window.innerHeight;
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScrollTop));
    
    // Fade out hero text by 30% scroll
    const heroText = document.getElementById('hero-text-overlay');
    if (heroText) {
      if (scrollFraction <= 0.3) {
        const opacity = 1 - (scrollFraction / 0.3);
        heroText.style.opacity = Math.max(0, opacity).toString();
      } else {
        heroText.style.opacity = '0';
      }
    }
    
    const frameIndex = Math.min(frameCount - 1, Math.ceil(scrollFraction * frameCount));
    if (images[frameIndex]) {
        drawImageProp(context, images[frameIndex]);
    }
  });

  // Initialize Intersection Observer for Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            // Optional: remove visible class if you want them to animate again on scroll up
            entry.target.classList.remove('visible');
        }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.glass-card').forEach(card => {
    observer.observe(card);
  });
};

const updateImage = index => {
  if (images[index]) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawImageProp(context, images[index]);
  }
}

// Start preload
preloadImages();
