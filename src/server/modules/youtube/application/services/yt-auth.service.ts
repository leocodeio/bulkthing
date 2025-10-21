import { v4 as uuidv4 } from 'uuid';
import { YtCreatorStatus } from '../../../creator/domain/enums/yt-creator-status.enum';
import { CreateEntryDto } from '../../../creator/application/dtos/create-entry.dto';
import { YtCreatorService } from '../../../creator/application/services/yt-creator.service';
import { UpdateEntryDto } from '../../../creator/application/dtos/update-entry.dto';

export class YtAuthService {
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
  ];
  private readonly REDIRECT_URI =
    process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/youtube/callback';

  constructor(private readonly ytCreatorService: YtCreatorService) {}

  async getAuthUrl(): Promise<string> {
    try {
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('YouTube credentials not configured');
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: this.REDIRECT_URI,
        response_type: 'code',
        scope: this.SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      console.log('[YtAuthService] Generated auth URL');
      return authUrl;
    } catch (error) {
      console.error('[YtAuthService] Failed to generate auth URL:', error);
      throw new Error('Authentication failed');
    }
  }

  async handleOAuthCallback(
    code: string,
    email?: string,
  ): Promise<{ id: string; message: string }> {
    try {
      console.log('[YtAuthService] Received OAuth code');

      if (!code) {
        throw new Error('Authorization code is required');
      }

      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('YouTube credentials not configured');
      }

      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get tokens from Google');
      }

      const tokens = (await tokenResponse.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };

      console.log('[YtAuthService] Received OAuth tokens');

      if (!tokens.access_token) {
        throw new Error('Invalid tokens from Google');
      }

      const creatorDto: CreateEntryDto = {
        creatorId: uuidv4(),
        email: email || 'unknown@unknown.com',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        status: YtCreatorStatus.active,
      };

      console.log('[YtAuthService] Saving creator entry');
      const creator = await this.ytCreatorService.createCreatorEntry(creatorDto);

      return {
        id: creator.id!,
        message: 'Successfully authenticated with YouTube',
      };
    } catch (error) {
      console.error('[YtAuthService] OAuth callback failed:', error);
      throw error;
    }
  }

  async getChannelInfo(id: string): Promise<unknown> {
    try {
      console.log('[YtAuthService] Getting channel info for creator:', id);

      if (!id) {
        throw new Error('Creator ID is required');
      }

      const creator = await this.ytCreatorService.getCreatorEntryById(id);

      if (!creator) {
        throw new Error('No authenticated creator found');
      }

      const accessToken = creator.accessToken;
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get channel info from YouTube');
      }

      const data = await response.json();
      console.log('[YtAuthService] Channel info retrieved');
      return data;
    } catch (error) {
      console.error('[YtAuthService] Failed to get channel info:', error);
      throw error;
    }
  }

  async uploadVideo(
    id: string,
    videoBuffer: Buffer,
    metadata: {
      title: string;
      description: string;
      tags?: string[];
      privacyStatus?: 'private' | 'unlisted' | 'public';
    },
  ): Promise<unknown> {
    try {
      console.log('[YtAuthService] Starting video upload for creator:', id);

      const creator = await this.ytCreatorService.getCreatorEntryById(id);

      if (!creator) {
        throw new Error('No authenticated creator found');
      }

      let accessToken = creator.accessToken;

      if (!(await this.getTokenValidity(accessToken))) {
        console.log('[YtAuthService] Token expired, refreshing...');
        accessToken = await this.refreshToken(creator.refreshToken);

        await this.ytCreatorService.updateCreatorEntry(creator.id!, {
          accessToken,
          refreshToken: creator.refreshToken,
        } as UpdateEntryDto);
      }

      const requestBody = {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          categoryId: '22',
        },
        status: {
          privacyStatus: metadata.privacyStatus || 'private',
          selfDeclaredMadeForKids: false,
        },
      };

      const formData = new FormData();
      formData.append('metadata', JSON.stringify(requestBody));
      formData.append('video', new Blob([new Uint8Array(videoBuffer)]), 'video.mp4');

      const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to YouTube');
      }

      const data = await response.json();
      console.log('[YtAuthService] Video uploaded successfully');
      return data;
    } catch (error) {
      console.error('[YtAuthService] Failed to upload video:', error);
      throw error;
    }
  }

  private async getTokenValidity(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      const data = (await response.json()) as { expires_in?: number };
      return data.expires_in ? data.expires_in > 0 : false;
    } catch (error) {
      console.error('[YtAuthService] Failed to check token validity:', error);
      return false;
    }
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    try {
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('YouTube credentials not configured');
      }

      const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = (await response.json()) as { access_token: string };
      console.log('[YtAuthService] Token refreshed successfully');
      return data.access_token;
    } catch (error) {
      console.error('[YtAuthService] Failed to refresh token:', error);
      throw new Error('Failed to refresh token');
    }
  }
}
