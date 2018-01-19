import * as Promise from 'bluebird';

export interface ChatMessage {
  id: string;
  message: string;
}

export interface MSTeamsService {
  listMembers(string): Promise<any>;
  chatMessage(ChatMessage): Promise<any>;
  postActionCard(actions, organizer): Promise<any>;
}