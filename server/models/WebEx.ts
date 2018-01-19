import * as Promise from 'bluebird';

export interface CreateMeetingParams {
  subject: string;
  agenda?: string;
  attendees: [{ displayName, mail }];
  startDate: string;
  duration: number,
  timeZone: string;
}

export interface HostJoinMeetingUrl {
  meetingKey: string;
}

export interface ParticipantJoinMeetingUrl extends HostJoinMeetingUrl {
  meetingPassword: string;
  attendee: string;
}

export interface JoinUrlResult {
  joinUrl: string;
}

export interface MeetingHandler {
  xsiType: string;
  content: Object;
  tagName: string;
  parser: string;
}

export interface TimeZones {
  timeZone: string;
  timeZoneId: number;
}

export interface MeetingService {
  getSummary(): Promise<any>;
  get({ string }): Promise<any>;
  create(CreateMeetingParams): Promise<any>;
  createInstantly(any): Promise<any>;
  joinUrls(ParticipantJoinMeetingUrl): Promise<JoinUrlResult>;
  hostJoinUrl(HostJoinMeetingUrl): Promise<JoinUrlResult>;
  meetingHandler(MeetingHandler): Promise<any>;
  timeZones: [TimeZones];
}