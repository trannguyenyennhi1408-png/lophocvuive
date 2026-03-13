
export interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface VideoResult {
  id: string;
  url: string;
  prompt: string;
  style: string;
}

export interface LoadingState {
  active: boolean;
  message: string;
}
