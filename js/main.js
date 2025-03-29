// Main JavaScript for EIILM Landing Page

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contact-form');
const applyButtons = document.querySelectorAll('.apply-btn');
const applyDialog = document.getElementById('apply-dialog');
const dialogClose = document.getElementById('dialog-close');
const applyForm = document.getElementById('apply-form');

// Create toast container if it doesn't exist
let toastContainer = document.querySelector('.toast-container');
if (!toastContainer) {
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  console.log('Created toast container');
}

console.log('DOM Elements loaded:');
console.log('- Apply buttons found:', applyButtons ? applyButtons.length : 0);
console.log('- Apply dialog found:', applyDialog ? true : false);
console.log('- Dialog close button found:', dialogClose ? true : false);
console.log('- Apply form found:', applyForm ? true : false);

// Theme Toggle Functionality
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.classList.remove('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

function toggleTheme() {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  navLinks.classList.toggle('active');
}

// Dialog Functionality
function openDialog() {
  applyDialog.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDialog() {
  applyDialog.classList.remove('active');
  document.body.style.overflow = '';
}

// Close dialog when clicking outside
function handleDialogClick(e) {
  if (e.target === applyDialog) {
    closeDialog();
  }
}

// Form Submission
function handleContactFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: e.target.elements.name.value,
    phone: e.target.elements.phone.value,
    program: e.target.elements.program.value,
    timestamp: new Date().toISOString()
  };
  
  // Save to localStorage for record keeping
  const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  submissions.push(formData);
  localStorage.setItem('formSubmissions', JSON.stringify(submissions));
  
  // Send to server
  console.log('Sending form data to server:', formData);
  
  // Make sure we're using the correct URL for our server
  const baseUrl = window.location.origin;
  const submitUrl = `${baseUrl}/api/submit-form`;
  
  console.log('Submitting to URL:', submitUrl);
  
  fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'simple-version' // Add identifier for server to detect simple version
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    return response.json();
  })
  .then(data => {
    console.log('Success data:', data);
    
    // Create a text file for download
    downloadFormData(formData);
    
    // Also save to submissions.json file locally via another method
    try {
      // Create a local text file to simulate saving to server
      const saveData = {
        ...formData,
        savedLocally: true,
        clientTimestamp: new Date().toISOString()
      };
      
      // Create a 'backup' of submission in localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('submissionsBackup') || '[]');
      localSubmissions.push(saveData);
      localStorage.setItem('submissionsBackup', JSON.stringify(localSubmissions));
      
      console.log('Saved backup of submission to localStorage');
    } catch (err) {
      console.error('Error creating local backup:', err);
    }
    
    // Show success message
    showToast('Success', 'Your form has been submitted successfully!', 'success');
    
    // Reset form
    e.target.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    console.error('Error details:', error.message, error.stack);
    showToast('Error', 'There was an error submitting your form. Please try again.', 'error');
  });
}

function handleApplyFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: e.target.elements.name.value,
    phone: e.target.elements.phone.value,
    program: e.target.elements.program.value,
    timestamp: new Date().toISOString()
  };
  
  // Save to localStorage for record keeping
  const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  submissions.push(formData);
  localStorage.setItem('formSubmissions', JSON.stringify(submissions));
  
  // Send to server
  console.log('Sending apply form data to server:', formData);
  
  // Make sure we're using the correct URL for our server
  const baseUrl = window.location.origin;
  const submitUrl = `${baseUrl}/api/submit-form`;
  
  console.log('Submitting apply form to URL:', submitUrl);
  
  fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'simple-version' // Add identifier for server to detect simple version
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    console.log('Apply form response status:', response.status);
    console.log('Apply form response headers:', [...response.headers.entries()]);
    return response.json();
  })
  .then(data => {
    console.log('Apply form success data:', data);
    
    // Create a text file for download
    downloadFormData(formData);
    
    // Also save to submissions.json file locally via another method
    try {
      // Create a local text file to simulate saving to server
      const saveData = {
        ...formData,
        savedLocally: true,
        clientTimestamp: new Date().toISOString(),
        formType: 'apply'
      };
      
      // Create a 'backup' of submission in localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('submissionsBackup') || '[]');
      localSubmissions.push(saveData);
      localStorage.setItem('submissionsBackup', JSON.stringify(localSubmissions));
      
      console.log('Saved backup of apply form to localStorage');
    } catch (err) {
      console.error('Error creating local backup for apply form:', err);
    }
    
    // Show success message
    showToast('Success', 'Your application has been submitted successfully!', 'success');
    
    // Close dialog and reset form
    closeDialog();
    e.target.reset();
  })
  .catch(error => {
    console.error('Apply form error:', error);
    console.error('Apply form error details:', error.message, error.stack);
    showToast('Error', 'There was an error submitting your form. Please try again.', 'error');
  });
}

// Download form data as text file
function downloadFormData(formData) {
  const dataStr = `
EIILM Form Submission
---------------------
Name: ${formData.name}
Phone: ${formData.phone}
Program: ${formData.program}
Timestamp: ${formData.timestamp}
  `;
  
  const element = document.createElement('a');
  const file = new Blob([dataStr], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `eiilm-submission-${Date.now()}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Toast Notifications
function showToast(title, message, type = 'success') {
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  
  let icon = '<i class="fas fa-check-circle toast-icon"></i>';
  if (type === 'error') {
    icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';
  }
  
  toast.innerHTML = `
    ${icon}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 5000);
}

// Brochure Download
function downloadBrochure() {
  const link = document.createElement('a');
  link.href = 'assets/brochure.pdf';
  link.download = 'EIILM-Brochure.pdf';
  link.click();
  
  showToast('Success', 'Brochure download started!', 'success');
}

// Testimonial Slider
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');

function showTestimonial(index) {
  testimonials.forEach(testimonial => {
    testimonial.style.display = 'none';
  });
  
  testimonials[index].style.display = 'flex';
}

function nextTestimonial() {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  showTestimonial(currentTestimonial);
}

function prevTestimonial() {
  currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
  showTestimonial(currentTestimonial);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  initTheme();
  
  // Event listeners
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
  
  if (applyForm) {
    applyForm.addEventListener('submit', handleApplyFormSubmit);
  }
  
  // Make sure Apply buttons are properly connected
  console.log('Setting up apply buttons...');
  if (applyButtons.length > 0) {
    console.log(`Found ${applyButtons.length} apply buttons, attaching event listeners`);
    applyButtons.forEach((button, index) => {
      console.log(`- Apply button ${index+1} found:`, button);
      button.addEventListener('click', function(e) {
        console.log('Apply button clicked!');
        openDialog();
      });
    });
  } else {
    console.warn('No Apply buttons found on the page!');
    
    // Try to find them again with a more generic selector
    const allButtons = document.querySelectorAll('button');
    console.log(`Found ${allButtons.length} total buttons`);
    
    allButtons.forEach((button, index) => {
      if (button.textContent.includes('Apply') || button.classList.contains('apply-btn')) {
        console.log(`Found missed Apply button ${index}:`, button);
        button.addEventListener('click', function(e) {
          console.log('Apply button (recovered) clicked!');
          openDialog();
        });
      }
    });
  }
  
  if (dialogClose) {
    dialogClose.addEventListener('click', closeDialog);
  }
  
  if (applyDialog) {
    applyDialog.addEventListener('click', handleDialogClick);
  }
  
  // Download brochure buttons
  const brochureButtons = document.querySelectorAll('.download-brochure-btn');
  if (brochureButtons.length > 0) {
    brochureButtons.forEach(button => {
      button.addEventListener('click', downloadBrochure);
    });
  }
  
  // Initialize testimonial slider
  if (testimonials.length > 0) {
    showTestimonial(0);
    
    const nextButton = document.getElementById('testimonial-next');
    const prevButton = document.getElementById('testimonial-prev');
    
    if (nextButton) {
      nextButton.addEventListener('click', nextTestimonial);
    }
    
    if (prevButton) {
      prevButton.addEventListener('click', prevTestimonial);
    }
    
    // Auto rotate testimonials
    setInterval(nextTestimonial, 5000);
  }
  
  // Animation on scroll
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  function checkScroll() {
    animatedElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenHeight = window.innerHeight;
      
      if (elementPosition < screenHeight * 0.8) {
        element.classList.add('animated');
      }
    });
  }
  
  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Check on initial load
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    }
  });
});