import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { CVPdfDocument } from '../../components/cv-workspace/CVPdfDocument';
import { cvService } from '../../services/cv.service';
import { CVSections } from '../../types';

export function CVViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [snapshotData, setSnapshotData] = useState<CVSections | null>(null);
  const [versionNumber, setVersionNumber] = useState<number>(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestApproved = async () => {
      try {
        const res = await cvService.getLatestApprovedVersion(id!);
        setSnapshotData(res.data.snapshotData);
        setVersionNumber(res.data.versionNumber);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải phiên bản đã duyệt hoặc CV chưa được duyệt lần nào.');
      }
    };
    if (id) fetchLatestApproved();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!snapshotData) return;
    setIsDownloadingPdf(true);
    try {
      const doc = <CVPdfDocument data={snapshotData} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_Approved_v${versionNumber}_${snapshotData.personalInfo?.name || 'Umi'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Lỗi tạo PDF:', err);
      alert('Lỗi khi tải PDF. Vui lòng thử lại.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center text-red-500 mb-4">{error}</div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (!snapshotData) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Đang tải CV...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Topbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="text-slate-600">
            <ArrowLeft size={16} className="mr-1.5" />
            Trở lại
          </Button>
          <div className="h-4 w-px bg-slate-300"></div>
          <h1 className="text-sm font-semibold text-slate-800">
            Bản xem trước (Phiên bản đã duyệt v{versionNumber})
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <Download size={16} className="mr-1.5" />
            {isDownloadingPdf ? 'Đang tạo PDF...' : 'Tải PDF'}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <CVPreviewPanel data={snapshotData} scale={100} />
      </main>
    </div>
  );
}
