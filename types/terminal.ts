export interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'success' | 'warning';
  content: string;
  timestamp?: Date;
}

export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  permissions?: string;
}

export interface BootMessage {
  content: string;
  delay: number;
}
