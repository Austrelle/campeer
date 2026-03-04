// src/types/index.ts

export interface UserProfile {
  uid: string;
  fullName: string;
  studentId: string;
  email: string;
  contact: {
    fbLink: string;
    mobile: string;
  };
  academic: {
    campus: string;
    dept: string;
    course: string;
    year: number;
  };
  isApproved: boolean;
  role: 'student' | 'admin';
  createdAt: Date | any;
  avatarInitials?: string;
}

export interface Task {
  taskId: string;
  requesterId: string;
  requesterName: string;
  title: string;
  description: string;
  subject: string;
  budget: number;
  deadline: string;
  status: 'open' | 'claimed' | 'completed';
  claimedBy?: string;
  claimedByName?: string;
  createdAt: Date | any;
  tags?: string[];
}

export interface Feedback {
  feedbackId: string;
  userId: string;
  userName: string;
  type: 'suggestion' | 'report' | 'general';
  message: string;
  status: 'pending' | 'reviewed';
  createdAt: Date | any;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  type: 'task' | 'approval' | 'system';
  createdAt: Date | any;
  link?: string;
}
