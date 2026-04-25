'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as pdfjs from 'pdfjs-dist';

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js`;

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  modifiedTime: string;
}

export function useWorkspace() {
  const { googleAccessToken } = useAuth();
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listFiles = useCallback(async (folderId: string = 'root') => {
    if (!googleAccessToken) return;
    setLoading(true);
    try {
      const q = `'${folderId}' in parents and trashed = false`;
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=folder,name&fields=files(id, name, mimeType, webViewLink, iconLink, modifiedTime)`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [googleAccessToken]);

  const fetchRecentFiles = useCallback(async () => {
    if (!googleAccessToken) return;
    setLoading(true);
    try {
      const query = "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.google-apps.presentation'";
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=recency desc&pageSize=10&fields=files(id, name, mimeType, webViewLink, iconLink, modifiedTime)`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [googleAccessToken]);

  const fetchFileContent = useCallback(async (fileId: string, mimeType: string) => {
    if (!googleAccessToken) throw new Error('Not authenticated');
    if (mimeType === 'application/vnd.google-apps.folder') {
      const q = `'${fileId}' in parents and trashed = false`;
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(name, mimeType)`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );
      const data = await res.json();
      const files = data.files || [];
      return `รายการไฟล์ในโฟลเดอร์นี้:\n${files.map((f: any) => `- ${f.name} (${f.mimeType === 'application/vnd.google-apps.folder' ? 'โฟลเดอร์' : 'ไฟล์'})`).join('\n')}`;
    }
    if (mimeType === 'text/plain' || mimeType === 'application/json' || mimeType === 'text/markdown') {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );
      if (!response.ok) throw new Error('ไม่สามารถโหลดเนื้อหาไฟล์ได้');
      return await response.text();
    }
    
    if (mimeType === 'application/pdf') {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );
      if (!response.ok) throw new Error('ไม่สามารถโหลดไฟล์ PDF ได้');
      const arrayBuffer = await response.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return `[เนื้อหาจากไฟล์ PDF: ${pdf.numPages} หน้า]\n\n${fullText}`;
    }

    if (mimeType !== 'application/vnd.google-apps.document') {
      throw new Error(`AI ยังไม่รองรับการอ่านไฟล์ประเภท ${mimeType} (รองรับ Google Docs, PDF และไฟล์ข้อความเท่านั้น)`);
    }
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );
    if (!response.ok) throw new Error('ไม่สามารถอ่านไฟล์ได้');
    return await response.text();
  }, [googleAccessToken]);

  return { files, loading, error, fetchRecentFiles, fetchFileContent, listFiles };
}
