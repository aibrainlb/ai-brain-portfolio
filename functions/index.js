<!-- EmailJS Contact Form Script -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
    emailjs.init('wUm2W6wA9LvjugBXb');
    
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            emailjs.send('service_wp6rpc4', 'template_z6lh1bj', formData)
                .then(function() {
                    formMessage.innerHTML = '✅ Message sent successfully!';
                    formMessage.className = 'form-message success';
                    formMessage.style.display = 'block';
                    contactForm.reset();
                }, function(error) {
                    formMessage.innerHTML = '❌ Failed to send message. Please try again.';
                    formMessage.className = 'form-message error';
                    formMessage.style.display = 'block';
                });
        });
    }
</script>