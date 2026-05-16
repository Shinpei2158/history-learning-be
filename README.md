# History Learning Platform Backend

An interactive history learning platform backend designed for middle school students and teachers, providing structured lessons, quizzes, flashcards, classroom management, and gamified learning experiences.

---

## Project Overview

This project was developed as a business-oriented educational platform focused on improving history learning accessibility and engagement for secondary school students.

Unlike traditional self-learning platforms, learning content is curated and managed by teachers to ensure higher content quality and reliability.

The system combines:
- Structured lesson delivery
- Interactive learning methods
- Classroom management
- Real-time learning activities
- Gamification mechanics

---

## Main Features

### Authentication & Authorization
- JWT authentication
- Role-based access control
- Student and Teacher roles
- Protected APIs using guards and decorators

### Lesson Learning System
- Slide-based history lessons
- Embedded educational videos
- Lesson progress tracking
- Historical figures and historical location content

### Flashcard & Quiz System
- Teacher-created flashcards
- Multiple-choice quizzes
- Quiz attempt tracking
- Learning progress analytics

### Exam Management
- Exam banks and question management
- Exam sessions
- Student exam attempts
- Automatic score calculation

### Classroom & Group System
- Teachers can create learning groups/classes
- Students can join groups
- Assignment and activity management

### Social Features
- Friend system
- Real-time online/offline presence using WebSocket
- Student interaction support

### Gamification System
- Achievement system
- Learning rewards and points
- Avatar and frame unlock system
- Student engagement mechanics

---

## Tech Stack

### Backend
- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

---

## Backend Architecture

The backend follows modular architecture principles using:
- Modules
- Controllers
- Services
- DTO validation
- MongoDB schema models
- Event-driven achievement handling

### Main Modules
- Auth Module
- Users Module
- Lesson Module
- Flashcard Module
- Quiz Module
- Exam Module
- Friendship Module
- Group Module
- Achievement Module
- Statistic Module

---

## Real-Time Features

The platform uses WebSocket gateways for:
- User online/offline presence
- Real-time interaction support
- Social activity synchronization

---

## Gamification Design

Students receive points by:
- Completing lessons
- Finishing quizzes and exams
- Unlocking achievements

Points can be exchanged for:
- Avatars
- Avatar frames
- Cosmetic profile items

This system was designed to improve student engagement and learning motivation.

---

## Project Structure

```bash
src/
├── auth/
├── users/
├── lesson/
├── flashcard/
├── quiz/
├── exam/
├── friendship/
├── achievement/
├── group/
└── common/
```

---

## Installation

### Clone repository

```bash
git clone <your-repository-url>
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

---

## Run The Project

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

---

## Future Improvements

Planned features:
- Admin dashboard
- AI-assisted learning recommendations
- Interactive historical maps
- Real-time classroom sessions
- Analytics dashboard
- Content moderation system

---

## Project Status

This project is currently under active development and was initially developed for an academic enterprise-oriented software engineering project.

---

## Author

Developed by Shinpei.
