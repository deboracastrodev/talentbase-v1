/**
 * Candidate API client.
 * Story 3.1: Profile creation and management.
 */

import type {
  CandidateProfile,
  PresignedUrlResponse,
  ApiError,
} from '../types/candidate';

import { getApiBaseUrl } from '~/config/api';

const API_BASE = getApiBaseUrl();

/**
 * Get authentication token from cookie/session.
 * TODO: Implement proper token retrieval based on auth strategy.
 */
function getAuthToken(): string | null {
  // This will be implemented with actual auth integration
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
  }
  return null;
}

/**
 * Make authenticated API request.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
}

/**
 * Get presigned URL for S3 upload.
 *
 * @param filename - Original filename
 * @param contentType - MIME type
 * @param type - Upload type ('photo' or 'video')
 * @returns Presigned URL data
 */
export async function getUploadUrl(
  filename: string,
  contentType: string,
  type: 'photo' | 'video'
): Promise<PresignedUrlResponse> {
  const params = new URLSearchParams({
    filename,
    content_type: contentType,
    type,
  });

  return apiRequest<PresignedUrlResponse>(
    `/api/v1/candidates/upload-url?${params}`
  );
}

/**
 * Upload file to S3 using presigned URL.
 *
 * @param file - File to upload
 * @param presignedData - Presigned URL data from getUploadUrl
 * @param onProgress - Progress callback (0-100)
 * @returns Final file URL
 */
export async function uploadToS3(
  file: File,
  presignedData: PresignedUrlResponse,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    // Add presigned fields first
    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add file last
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(Math.round(progress));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 204 || xhr.status === 200) {
        resolve(presignedData.file_url);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', presignedData.url);
    xhr.send(formData);
  });
}

/**
 * Create candidate profile.
 *
 * @param data - Profile data
 * @returns Created profile
 */
export async function createCandidateProfile(
  data: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>('/api/v1/candidates/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Save draft profile.
 *
 * @param profileId - Profile ID
 * @param data - Partial profile data
 * @returns Updated profile
 */
export async function saveDraft(
  profileId: number,
  data: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/api/v1/candidates/${profileId}/draft`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Update profile photo.
 *
 * @param profileId - Profile ID
 * @param photoUrl - S3 photo URL
 * @returns Updated profile
 */
export async function updateProfilePhoto(
  profileId: number,
  photoUrl: string
): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/api/v1/candidates/${profileId}/photo`, {
    method: 'PUT',
    body: JSON.stringify({ profile_photo_url: photoUrl }),
  });
}

/**
 * Update pitch video.
 *
 * @param profileId - Profile ID
 * @param videoUrl - S3 or YouTube URL
 * @param videoType - 's3' or 'youtube'
 * @returns Updated profile
 */
export async function updatePitchVideo(
  profileId: number,
  videoUrl: string,
  videoType: 's3' | 'youtube'
): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/api/v1/candidates/${profileId}/video`, {
    method: 'PUT',
    body: JSON.stringify({
      pitch_video_url: videoUrl,
      pitch_video_type: videoType,
    }),
  });
}
