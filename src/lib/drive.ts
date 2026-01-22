import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Singleton to reuse the auth client structure
export class DriveClient {
    private async getAuth() {
        const session = await getServerSession(authOptions);
        if (!(session as any)?.accessToken) {
            console.error("DriveAuth: No access token in session.");
            throw new Error("Not authenticated");
        }

        const token = (session as any).accessToken as string;
        console.log("DriveAuth: Using Token:", token.substring(0, 10) + "...");

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: token });
        return auth;
    }

    async listFiles(folderId?: string) {
        const auth = await this.getAuth();
        const drive = google.drive({ version: 'v3', auth });

        // Example query: list folders and files in specific parent
        const q = folderId
            ? `'${folderId}' in parents and trashed = false`
            : "'root' in parents and trashed = false";

        const res = await drive.files.list({
            q,
            fields: 'files(id, name, mimeType, parents)',
            pageSize: 100,
        });
        return res.data.files || [];
    }

    async createFolder(name: string, parentId?: string) {
        const auth = await this.getAuth();
        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata: any = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentId) {
            fileMetadata.parents = [parentId];
        }

        const res = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name',
        });
        return res.data;
    }

    async getFileContent(fileId: string) {
        const auth = await this.getAuth();
        const drive = google.drive({ version: 'v3', auth });

        const res = await drive.files.get({
            fileId,
            alt: 'media',
        });
        return res.data;
    }

    async createFile(name: string, content: string, mimeType: string, parentId?: string) {
        const auth = await this.getAuth();
        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata: any = {
            name,
        };
        if (parentId) {
            fileMetadata.parents = [parentId];
        }

        const media = {
            mimeType,
            body: content,
        };

        const res = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name',
        });
        return res.data;
    }

    async updateFile(fileId: string, content: string, mimeType: string) {
        const auth = await this.getAuth();
        const drive = google.drive({ version: 'v3', auth });

        const media = {
            mimeType,
            body: content,
        };

        const res = await drive.files.update({
            fileId,
            media: media,
            fields: 'id, name',
        });
        return res.data;
    }

    async findFolder(name: string, parentId?: string) {
        const files = await this.listFiles(parentId);
        return files.find(f => f.name === name && f.mimeType === 'application/vnd.google-apps.folder');
    }
}

export const driveClient = new DriveClient();
