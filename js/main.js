// Main JavaScript for EIILM Landing Page
const CONFIG = {
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbwZ1X5NXD80mrz-eAwMc6d_dq3unaD6rGf3MIFBeoV7Ud82GqxUbaKf3ZnGyxikh6Z2Dw/exec",
  enableLocalStorage: true,
  enableFileDownload: true
};
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

// Enhanced Form Submission
async function handleContactFormSubmit(e) {
  e.preventDefault();

  // Validate form data
  const formName = e.target.elements.name.value.trim();
  const formPhone = e.target.elements.phone.value.trim();
  const formProgram = e.target.elements.program.value;

  // Basic validation
  if (!formName || formName.length < 2) {
    showToast('Form Error', 'Please enter a valid name (at least 2 characters)', 'error');
    e.target.elements.name.focus();
    return;
  }

  if (!formPhone || formPhone.length < 10) {
    showToast('Form Error', 'Please enter a valid phone number (at least 10 digits)', 'error');
    e.target.elements.phone.focus();
    return;
  }
  if (!formPhone || formPhone.length > 10) {
    showToast('Form Error', 'Please enter a valid phone number (at least 10 digits)', 'error');
    e.target.elements.phone.focus();
    return;
  }

  if (!formProgram) {
    showToast('Form Error', 'Please select a program of interest', 'error');
    e.target.elements.program.focus();
    return;
  }

  // Show submitting message for better user experience
  showToast('Submitting', 'Please wait while we process your request...', 'info');

  const formData = {
    name: formName,
    phone: formPhone,
    program: formProgram,
    timestamp: new Date().toISOString(),
    source: 'contact-form'
  };

  // Save to localStorage for record keeping & offline capability
  const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  submissions.push(formData);
  localStorage.setItem('formSubmissions', JSON.stringify(submissions));

  // Send to server
  console.log('Sending form data to server:', formData);

  // Make sure we're using the correct URL for our server
  // const baseUrl = window.location.origin;
  // const submitUrl = `${baseUrl}/api/submit-form`;

  // console.log('Submitting to URL:', submitUrl);

  // fetch(submitUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'User-Agent': 'simple-version' // Add identifier for server to detect simple version
  //   },
  //   body: JSON.stringify(formData)
  // })
  // .then(response => {
  //   console.log('Response status:', response.status);
  //   console.log('Response headers:', [...response.headers.entries()]);

  //   if (!response.ok) {
  //     throw new Error(`Server responded with status: ${response.status}`);
  //   }

  //   return response.json();
  // })
  // .then(data => {
  //   console.log('Success data:', data);

  //   // Create a text file for download with receipt
  //   downloadFormData(formData);
  try {
    const response = await fetch(CONFIG.googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Add this line
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Note: With no-cors you won't be able to read the response
    console.log('Submitted to Google Sheets');
    if(response){
      // Show success message with thank you
      showToast('Thank You!', 'Your application has been submitted successfully. We will review your application and contact you if we have any questions or concerns.', 'success');
      const brochureRequested = localStorage.getItem('brochureRequested') === 'true';
      if (brochureRequested) {
        console.log('Brochure was previously requested, starting download after delay');
        setTimeout(() => {
          showToast('Brochure Ready', 'Your brochure is being prepared for download...', 'info');
  
          setTimeout(() => {
            startBrochureDownload();
            localStorage.removeItem('brochureRequested'); // Clear the flag
          }, 1000);
        }, 1500);
      }
      closeDialog();
        e.target.reset();
    } 
  } catch (error) {
    console.error('Error:', error);
  }

  //   // Create additional backup in localStorage
  //   try {
  //     const saveData = {
  //       ...formData,
  //       savedLocally: true,
  //       clientTimestamp: new Date().toISOString(),
  //       submissionId: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  //     };

  //     // Create a 'backup' of submission in localStorage
  //     const localSubmissions = JSON.parse(localStorage.getItem('submissionsBackup') || '[]');
  //     localSubmissions.push(saveData);
  //     localStorage.setItem('submissionsBackup', JSON.stringify(localSubmissions));

  //     console.log('Saved backup of submission to localStorage');
  //   } catch (err) {
  //     console.error('Error creating local backup:', err);
  //   }

  //   // Show success message with thank you
  //   showToast('Thank You!', 'Your information has been submitted successfully. Our admissions team will contact you shortly.', 'success');

  //   // Check if brochure was requested and provide it with a delay for better UX


  //   // Reset form
  //   e.target.reset();
  // })
  // .catch(error => {
  //   console.error('Error:', error);
  //   console.error('Error details:', error.message, error.stack);

  //   // We still show success to the user because we've saved the data locally
  //   // This ensures a good user experience even if the server has issues
  //   showToast('Thank You!', 'Your information has been saved. Our admissions team will contact you shortly.', 'success');

  //   // But we also log the error for our information
  //   console.log('Storing submission for later retry due to server error');

  //   // Check if brochure was requested and still provide it
  //   const brochureRequested = localStorage.getItem('brochureRequested') === 'true';
  //   if (brochureRequested) {
  //     setTimeout(() => {
  //       startBrochureDownload();
  //       localStorage.removeItem('brochureRequested');
  //     }, 1000);
  //   }

  //   // Reset form since we've captured the data
  //   e.target.reset();
  // });
}


async function handleApplyFormSubmit(e) {
  e.preventDefault();
  
  // Validate form data
  const formName = e.target.elements.name.value.trim();
  const formPhone = e.target.elements.phone.value.trim();
  const formProgram = e.target.elements.program.value;
  
  // Basic validation
  if (!formName || formName.length < 2) {
    showToast('Form Error', 'Please enter a valid name (at least 2 characters)', 'error');
    e.target.elements.name.focus();
    return;
  }
  
  if (!formPhone || formPhone.length < 10) {
    showToast('Form Error', 'Please enter a valid phone number (at least 10 digits)', 'error');
    e.target.elements.phone.focus();
    return;
  }
  
  if (!formProgram) {
    showToast('Form Error', 'Please select a program of interest', 'error');
    e.target.elements.program.focus();
    return;
  }
  
  // Show submitting message for better user experience
  showToast('Submitting', 'Please wait while we process your application...', 'info');
  
  const formData = {
    name: formName,
    phone: formPhone,
    program: formProgram,
    source: 'apply-form'
  };
  console.log(formData);
  
  // Save to localStorage for record keeping & offline capability
  const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  submissions.push(formData);
  localStorage.setItem('formSubmissions', JSON.stringify(submissions));
  
  // Send to server
  console.log('Sending apply form data to server:', formData);
  try {
    const response = await fetch(CONFIG.googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Add this line
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Note: With no-cors you won't be able to read the response
    console.log('Submitted to Google Sheets');
    if(response){
      // Show success message with thank you
      showToast('Thank You!', 'Your application has been submitted successfully. We will review your application and contact you if we have any questions or concerns.', 'success');
      
      closeDialog();
      //   e.target.reset();
    } 
  } catch (error) {
    console.error('Error:', error);
  }
  
  // if (!response.ok) throw new Error('Server error');

  
  // fetch(submitUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'User-Agent': 'simple-version' // Add identifier for server to detect simple version
  //   },
  //   body: JSON.stringify(formData)
  // })
  // .then(response => {
  //   console.log('Apply form response status:', response.status);
  //   console.log('Apply form response headers:', [...response.headers.entries()]);
    
  //   if (!response.ok) {
  //     throw new Error(`Server responded with status: ${response.status}`);
  //   }
    
  //   return response.json();
  // })
  // .then(data => {
  //   console.log('Apply form success data:', data);
    
  //   // Create a text file for download with receipt
  //   downloadFormData(formData);
    
  //   // Create additional backup in localStorage
  //   // try {
  //   //   const saveData = {
  //   //     ...formData,
  //   //     savedLocally: true,
  //   //     clientTimestamp: new Date().toISOString(),
  //   //     formType: 'apply',
  //   //     submissionId: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  //   //   };
      
  //   //   // Create a 'backup' of submission in localStorage
  //   //   const localSubmissions = JSON.parse(localStorage.getItem('submissionsBackup') || '[]');
  //   //   localSubmissions.push(saveData);
  //   //   localStorage.setItem('submissionsBackup', JSON.stringify(localSubmissions));
      
  //   //   console.log('Saved backup of apply form to localStorage');
  //   // } catch (err) {
  //   //   console.error('Error creating local backup for apply form:', err);
  //   // }
    
  //   // Show success message with thank you
  //   showToast('Application Received!', 'Your application has been submitted successfully. Our admissions team will contact you shortly to discuss next steps.', 'success');
    
  //   // Check if brochure was requested and provide it with delay for better UX
  //   const brochureRequested = localStorage.getItem('brochureRequested') === 'true';
  //   if (brochureRequested) {
  //     console.log('Brochure was previously requested, starting download after delay');
  //     setTimeout(() => {
  //       showToast('Brochure Ready', 'Your program brochure is being prepared for download...', 'info');
        
  //       // Wait a moment before starting download for better UX
  //       setTimeout(() => {
  //         startBrochureDownload();
  //         localStorage.removeItem('brochureRequested'); // Clear the flag
  //       }, 800);
  //     }, 1500);
  //   }
    
  //   // Close dialog and reset form
  //   closeDialog();
  //   e.target.reset();
  // })
  // .catch(error => {
  //   console.error('Apply form error:', error);
  //   console.error('Apply form error details:', error.message, error.stack);
    
  //   // We still show success to the user because we've saved the data locally
  //   // This ensures a good user experience even if the server has issues
  //   showToast('Application Received!', 'Your application has been saved. Our admissions team will contact you shortly to discuss next steps.', 'success');
    
  //   // But we also log the error for our information
  //   console.log('Storing application for later retry due to server error');
    
  //   // Check if brochure was requested and still provide it
  //   const brochureRequested = localStorage.getItem('brochureRequested') === 'true';
  //   if (brochureRequested) {
  //     setTimeout(() => {
  //       showToast('Brochure Ready', 'Your program brochure is downloading now...', 'info');
  //       setTimeout(() => {
  //         startBrochureDownload();
  //         localStorage.removeItem('brochureRequested');
  //       }, 800);
  //     }, 1500);
  //   }
    
  //   // Close dialog and reset form since we've captured the data
  //   closeDialog();
  //   e.target.reset();
  // });
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
  } else if (type === 'info') {
    icon = '<i class="fas fa-info-circle toast-icon"></i>';
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

// Brochure Download - Strictly requires form submission
function downloadBrochure(e) {
  e.preventDefault();
  
  // Check if user has already submitted a form
  const storedSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  const hasSubmittedForm = storedSubmissions.length > 0;
  
  if (hasSubmittedForm) {
    // User has already submitted a form, allow direct download
    showToast('Thank You!', 'Your brochure is being prepared for download...', 'success');
    
    // Add a slight delay for better user experience
    setTimeout(() => {
      startBrochureDownload();
    }, 1000);
  } else {
    // User hasn't submitted a form, show clear notification and open apply dialog
    console.log('User has not submitted any forms, showing dialog');
    showToast('Form Required', 'Please fill out the contact form to access our brochure. This helps us understand your needs better.', 'info');
    
    // Open dialog with a slight delay for better UX
    setTimeout(() => {
      // Find the closest form - either the hero form or open a dialog
      const visibleForm = document.getElementById('contact-form');
      if (visibleForm && isElementInViewport(visibleForm)) {
        // If the form is visible, highlight it
        visibleForm.classList.add('highlight-form');
        setTimeout(() => {
          visibleForm.classList.remove('highlight-form');
        }, 2000);
        
        // Smooth scroll to form
        visibleForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Open dialog if form is not visible
        openDialog();
      }
    }, 300);
    
    // Set flag that download was requested
    localStorage.setItem('brochureRequested', 'true');
  }
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Actual download function
function startBrochureDownload() {
  console.log('Starting brochure download');
  
  // Create the download link
  const link = document.createElement('a');
  link.href = 'assets/brochure.pdf';
  link.download = 'EIILM-College-Brochure.pdf';
  
  // Add link to body, trigger download, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show confirmation toast with more specific information
  showToast('Download Started', 'Thank you for your interest in EIILM College! Your brochure is downloading now.', 'success');
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
  
  // Improved Animation on scroll with Intersection Observer
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  console.log('Found', animatedElements.length, 'animated elements');
  
  // Use Intersection Observer for better performance
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Once the animation is triggered, we don't need to observe it anymore
        animationObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null, // Use the viewport as the root
    rootMargin: '0px 0px -15% 0px', // Trigger before the element is 15% into the viewport
    threshold: 0.1 // Trigger when at least 10% of the element is visible
  });
  
  // Observe all animated elements
  animatedElements.forEach((element) => {
    animationObserver.observe(element);
  });
  
  // For elements that are already visible on page load
  setTimeout(() => {
    const viewportHeight = window.innerHeight;
    animatedElements.forEach((element) => {
      const boundingRect = element.getBoundingClientRect();
      if (boundingRect.top < viewportHeight * 0.85) {
        element.classList.add('animated');
        animationObserver.unobserve(element);
      }
    });
    console.log('Initial animation check completed');
  }, 300);
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
// Add this to your existing main.js file

// Enhanced Smooth Scroll for All Sections
function setupSmoothScroll() {
    // Select all sections with IDs
    const sections = document.querySelectorAll('section[id]');
    
    // Add scroll event listener
    window.addEventListener('scroll', function() {
      const scrollPosition = window.scrollY + 100; // Adding offset
      
      // Highlight active nav link
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active-link');
            }
          });
        }
      });
    });
    
    // Enhanced scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
          }
          
          // Add temporary highlight to the section
          target.classList.add('section-highlight');
          setTimeout(() => {
            target.classList.remove('section-highlight');
          }, 2000);
        }
      });
    });
  }
  
  // Call this function in your DOMContentLoaded event listener
  document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    setupSmoothScroll();
  });
  // Enhanced Testimonial Navigation
function setupTestimonialNavigation() {
    const testimonialNext = document.getElementById('testimonial-next');
    const testimonialPrev = document.getElementById('testimonial-prev');
    
    if (testimonialNext && testimonialPrev) {
      testimonialNext.addEventListener('click', function() {
        this.classList.add('button-click');
        setTimeout(() => this.classList.remove('button-click'), 300);
        nextTestimonial();
      });
      
      testimonialPrev.addEventListener('click', function() {
        this.classList.add('button-click');
        setTimeout(() => this.classList.remove('button-click'), 300);
        prevTestimonial();
      });
    }
  }
  
  // Call this in your DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    setupTestimonialNavigation();
    localStorage.removeItem('formSubmissions');

  });
  // Animate recruiter logos on scroll
function animateRecruitersOnScroll() {
  const recruiterSection = document.getElementById('recruiters');
  const recruiterLogos = document.querySelectorAll('.recruiter-logo');
  
  if (!recruiterSection || recruiterLogos.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        recruiterLogos.forEach(logo => {
          logo.classList.add('animate');
        });
        // Stop observing after animation triggers
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 }); // Trigger when 20% visible
  
  observer.observe(recruiterSection);
}

// Call this in your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  animateRecruitersOnScroll();
});