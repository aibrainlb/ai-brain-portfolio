# Contributing to Andy Ters Portfolio

First off, thank you for considering contributing to Andy Ters Portfolio! It's people like you that make this project better.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and encourage diverse perspectives
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node.js version, browser, etc.)
- **Error messages** or logs

Example bug report:
```markdown
**Bug**: Contact form not submitting on mobile Safari

**Steps to Reproduce**:
1. Open website on iPhone 13 with Safari
2. Navigate to Contact section
3. Fill out form and click Submit
4. Form does not submit

**Expected**: Form should submit and show success message
**Actual**: Nothing happens, no error message

**Environment**:
- Device: iPhone 13
- OS: iOS 16.4
- Browser: Safari
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why would this be useful?
- **Proposed solution** (if you have one)
- **Alternative solutions** you've considered
- **Additional context** like mockups, examples, etc.

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with clear messages**
6. **Submit a pull request**

#### Pull Request Process

1. Ensure your code follows the existing style
2. Update the README.md with details of changes if applicable
3. Update the CHANGELOG.md following Keep a Changelog format
4. The PR will be merged once you have approval from maintainers

## Development Setup

### Prerequisites
- Node.js v18.0.0 or higher
- MongoDB v6.0 or higher
- npm v9.0.0 or higher

### Setup Steps

1. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/andy-ters-portfolio.git
cd andy-ters-portfolio
```

2. **Add upstream remote**
```bash
git remote add upstream https://github.com/andyters/andy-ters-portfolio.git
```

3. **Install dependencies**
```bash
npm install
```

4. **Create .env file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start development server**
```bash
npm run dev
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features
- Use meaningful variable and function names
- Add comments for complex logic
- Use async/await for asynchronous code
- Handle errors appropriately

**Good Example:**
```javascript
// Fetch user data with error handling
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
```

**Bad Example:**
```javascript
// Unclear naming and poor error handling
const f = async (id) => {
  const r = await fetch('/api/users/' + id);
  return r.json(); // No error handling!
};
```

### CSS Style Guide

- Use meaningful class names
- Follow BEM naming convention when appropriate
- Use CSS variables for colors and reusable values
- Keep specificity low
- Mobile-first approach

**Good Example:**
```css
.project-card {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.project-card__title {
  font-size: 1.5rem;
  color: var(--text-primary);
}
```

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when relevant

**Good Examples:**
```
Add user authentication system
Fix contact form validation on mobile
Update README with deployment instructions
Refactor API routes for better organization
```

**Bad Examples:**
```
Fixed stuff
WIP
asdfasdf
```

### Project Structure

When adding new features, follow this structure:

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
└── utils/           # Utility functions

public/
├── css/            # Stylesheets
├── js/             # JavaScript files
├── images/         # Image assets
└── index.html      # Main HTML file
```

## Testing

Before submitting a pull request:

1. **Manual Testing**
   - Test all changed functionality
   - Test on different browsers (Chrome, Firefox, Safari)
   - Test on mobile devices
   - Test form validations
   - Test error scenarios

2. **API Testing**
   - Test all API endpoints
   - Verify proper error responses
   - Check rate limiting works
   - Verify database operations

3. **Code Quality**
   - No console errors in browser
   - No server errors in logs
   - Code is properly formatted
   - No unused variables or functions

## Documentation

- Update README.md for new features or changes
- Add JSDoc comments for functions
- Update API documentation for new endpoints
- Add inline comments for complex logic

Example JSDoc:
```javascript
/**
 * Submit contact form and send email notifications
 * @route POST /api/contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
exports.submitContactForm = async (req, res) => {
  // Implementation
};
```

## Questions?

Feel free to reach out if you have questions:
- Open an issue with the "question" label
- Email: contact@andyters.dev

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- CHANGELOG.md for their contributions
- Project documentation

Thank you for contributing! 🚀
