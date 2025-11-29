# Frontend - Online Academy Management System

Next.js-based frontend application for the Online Academy Management System.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your backend API URL
```

3. **Run development server:**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── students/          # Student management
│   ├── teachers/          # Teacher management
│   ├── lessons/           # Lesson tracking
│   ├── payments/          # Payment management
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/redirect page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Modal.tsx          # Modal component
│   └── Loading.tsx        # Loading spinner
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   └── types.ts           # TypeScript types
├── public/                # Static files
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind CSS config
└── next.config.js         # Next.js config
```

## Features

### Pages

#### Dashboard (`/dashboard`)
- System overview statistics
- Teacher hours today
- Student lesson history
- Alerts for unpaid fees and missing Teams IDs

#### Students (`/students`)
- Complete CRUD operations
- Filter by teacher and fee status
- Student details with teacher assignment
- Fee status tracking

#### Teachers (`/teachers`)
- Teacher management
- View teacher statistics (students, hours)
- Active/inactive status

#### Lessons (`/lessons`)
- Start/end lesson tracking
- Real-time active lesson indicator
- Lesson history with duration
- Automatic time calculation

#### Payments (`/payments`)
- Monthly fee tracking
- Mark payments as paid
- Revenue summaries
- Payment filtering

#### Login (`/login`)
- Secure authentication
- JWT token management
- Auto-redirect for authenticated users

## Components

### Navbar
Responsive navigation with route highlighting and logout functionality.

### Modal
Reusable modal component for forms and dialogs.

### Loading
Loading spinner for async operations.

## API Integration

The app uses Axios for API calls with:
- Automatic token injection
- Request/response interceptors
- Error handling
- Type-safe endpoints

### Example API Usage

```typescript
import { studentsAPI } from '@/lib/api';

// Get all students
const students = await studentsAPI.getAll();

// Create a student
const newStudent = await studentsAPI.create({
  name: "John Doe",
  fee_amount: 100.00,
  // ... other fields
});

// Update a student
await studentsAPI.update(studentId, {
  fee_status: "paid"
});
```

## Styling

### Tailwind CSS
The app uses Tailwind CSS for styling with custom utility classes:

```css
/* Button styles */
.btn              /* Base button */
.btn-primary      /* Primary action */
.btn-secondary    /* Secondary action */
.btn-danger       /* Destructive action */
.btn-success      /* Success action */

/* Form elements */
.input            /* Input field */
.card             /* Card container */

/* Tables */
.table            /* Table styling */

/* Badges */
.badge            /* Base badge */
.badge-success    /* Green badge */
.badge-danger     /* Red badge */
.badge-warning    /* Yellow badge */
.badge-info       /* Blue badge */
```

## Authentication Flow

1. User visits any protected route
2. If no token, redirect to `/login`
3. User logs in, receives JWT token
4. Token stored in localStorage
5. Token sent with all API requests
6. On 401 error, clear token and redirect to login

## State Management

The app uses React hooks for state management:
- `useState` for component state
- `useEffect` for data fetching
- `useRouter` for navigation

## TypeScript Types

All API responses are typed for type safety:

```typescript
interface Student {
  id: number;
  name: string;
  parent_contact?: string;
  teams_id?: string;
  assigned_teacher_id?: number;
  schedule?: string;
  fee_amount: number;
  fee_status: 'paid' | 'unpaid';
  notes?: string;
  // ... timestamps
}
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
```bash
npm run build
npm start
```

Or use PM2:
```bash
npm install -g pm2
pm2 start npm --name "academy-frontend" -- start
```

## Performance Optimization

- Next.js automatic code splitting
- Image optimization with next/image
- Font optimization with next/font
- Client-side navigation with next/link
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Error
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check CORS settings in backend

### Authentication Issues
- Clear localStorage and try logging in again
- Check token expiration
- Verify backend authentication endpoints

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License
