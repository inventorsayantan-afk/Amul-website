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

// Buy Now Modal Logic
const navBuyBtn = document.getElementById('nav-buy-btn');
const ctaBuyBtn = document.getElementById('cta-buy-btn');
const buyModal = document.getElementById('buy-modal');
const buyModalContent = document.getElementById('buy-modal-content');
const closeModalBtn = document.getElementById('close-modal-btn');
const buyForm = document.getElementById('buy-form');
const payBtnText = document.getElementById('pay-btn-text');
const paySpinner = document.getElementById('pay-spinner');
const payBtn = document.getElementById('pay-btn');

const successDialog = document.getElementById('success-dialog');
const successDialogContent = document.getElementById('success-dialog-content');
const closeSuccessBtn = document.getElementById('close-success-btn');

const openModal = () => {
    buyModal.classList.remove('hidden');
    buyModal.classList.add('flex');
    setTimeout(() => {
        buyModal.classList.remove('opacity-0');
        buyModalContent.classList.remove('scale-95');
        buyModalContent.classList.add('scale-100');
    }, 10);
};

const closeModal = () => {
    buyModal.classList.add('opacity-0');
    buyModalContent.classList.remove('scale-100');
    buyModalContent.classList.add('scale-95');
    setTimeout(() => {
        buyModal.classList.add('hidden');
        buyModal.classList.remove('flex');
        buyForm.reset();
    }, 300);
};

const openSuccessDialog = () => {
    successDialog.classList.remove('hidden');
    successDialog.classList.add('flex');
    setTimeout(() => {
        successDialog.classList.remove('opacity-0');
        successDialogContent.classList.remove('scale-95');
        successDialogContent.classList.add('scale-100');
    }, 10);
};

const closeSuccessDialog = () => {
    successDialog.classList.add('opacity-0');
    successDialogContent.classList.remove('scale-100');
    successDialogContent.classList.add('scale-95');
    setTimeout(() => {
        successDialog.classList.add('hidden');
        successDialog.classList.remove('flex');
    }, 300);
};

if (navBuyBtn) navBuyBtn.addEventListener('click', openModal);
if (ctaBuyBtn) ctaBuyBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeSuccessDialog);

// Close modal when clicking outside
if (buyModal) {
    buyModal.addEventListener('click', (e) => {
        if (e.target === buyModal) closeModal();
    });
}

// Form Submission
if (buyForm) {
    buyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show spinner
        payBtnText.innerText = 'Processing...';
        paySpinner.classList.remove('hidden');
        payBtn.disabled = true;

        // Simulate payment process delay
        setTimeout(() => {
            // Hide modal
            closeModal();
            
            // Reset button
            payBtnText.innerText = 'Pay via UPI';
            paySpinner.classList.add('hidden');
            payBtn.disabled = false;

            // Show success dialog
            setTimeout(() => {
                openSuccessDialog();
            }, 300); // wait for modal to close

        }, 1500);
    });
}

// Start preload
preloadImages();
