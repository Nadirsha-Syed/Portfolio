export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  extension?: string;
}

export interface Tab {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  architecture: string;
  endpoints: Endpoint[];
  period?: string;
  liveUrl?: string;
  highlights?: string[];
  backendFeatures?: string[];
  frontendFeatures?: string[];
  upcomingFeatures?: string[];
  responsibilities?: string[];
  results?: string[];
  teamwork?: string[];
}

export interface Endpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  mockResponse: unknown;
  mockLatency: number;
}
