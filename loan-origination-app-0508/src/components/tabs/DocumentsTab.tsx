import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  downloadEntityDocument,
  fetchEntityDocuments,
  type EntityDocument,
} from '../../services/loanService';
import type { LoanDetailData, LoanDocument } from '../../types/loan';

interface DocumentsTabProps {
  data: LoanDetailData;
  borrowerName?: string;
}

const ICON_COLORS: Record<NonNullable<LoanDocument['iconColor']>, { bg: string; fg: string }> = {
  red: { bg: 'var(--red-bg)', fg: 'var(--red)' },
  blue: { bg: 'var(--blue-bg)', fg: 'var(--blue)' },
  green: { bg: 'var(--green-bg)', fg: 'var(--green)' },
  purple: { bg: 'var(--purple-bg)', fg: 'var(--purple)' },
  amber: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
};

export function DocumentsTab({ data, borrowerName }: DocumentsTabProps) {
  const { sdk } = useAuth();
  const { toast } = useToast();
  const [entityDocs, setEntityDocs] = useState<EntityDocument[]>([]);
  const [attachmentField, setAttachmentField] = useState<string | null>(null);
  const [loadingEntity, setLoadingEntity] = useState(false);
  const [preview, setPreview] = useState<{
    title: string;
    url: string | null;
    loading: boolean;
  } | null>(null);

  const isPriya = (borrowerName ?? '').toLowerCase().includes('priya');

  useEffect(() => {
    if (!isPriya) {
      setEntityDocs([]);
      setAttachmentField(null);
      return;
    }
    let cancelled = false;
    setLoadingEntity(true);
    fetchEntityDocuments(sdk)
      .then((res) => {
        if (cancelled) return;
        setEntityDocs(res.documents);
        setAttachmentField(res.attachmentFieldName);
      })
      .catch((err) => {
        console.warn('fetchEntityDocuments failed', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingEntity(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sdk, isPriya]);

  const closePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const openEntityDoc = async (doc: EntityDocument) => {
    if (!attachmentField) {
      toast('No attachment field configured on documents entity');
      return;
    }
    setPreview({ title: doc.title, url: null, loading: true });
    try {
      const blob = await downloadEntityDocument(sdk, doc.recordId, attachmentField);
      // DataFabric returns the attachment as application/octet-stream, which makes
      // Chrome download instead of preview. Re-wrap as application/pdf so the
      // iframe renders inline.
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setPreview({ title: doc.title, url, loading: false });
    } catch (err) {
      console.warn('downloadEntityDocument failed', err);
      toast(err instanceof Error ? `Download failed: ${err.message}` : 'Download failed');
      setPreview(null);
    }
  };

  const showEntityList = isPriya && (loadingEntity || entityDocs.length > 0);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>
          Documents ({showEntityList ? entityDocs.length : data.documents.length})
        </div>
        <Button>+ Upload</Button>
      </div>
      <Card>
        {showEntityList ? (
          <EntityDocumentList
            loading={loadingEntity}
            docs={entityDocs}
            onOpen={openEntityDoc}
          />
        ) : (
          <MockDocumentList docs={data.documents} />
        )}
      </Card>

      {preview && (
        <PdfPreviewModal
          title={preview.title}
          url={preview.url}
          loading={preview.loading}
          onClose={closePreview}
        />
      )}
    </div>
  );
}

function EntityDocumentList({
  loading,
  docs,
  onOpen,
}: {
  loading: boolean;
  docs: EntityDocument[];
  onOpen: (doc: EntityDocument) => void;
}) {
  if (loading && docs.length === 0) {
    return (
      <div className="px-3.5 py-6 text-[12px]" style={{ color: 'var(--fg4)' }}>
        Loading documents…
      </div>
    );
  }
  return (
    <div>
      {docs.map((doc, idx) => (
        <button
          key={doc.recordId}
          onClick={() => onOpen(doc)}
          className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors"
          style={{
            borderBottom: idx < docs.length - 1 ? '1px solid var(--border)' : 'none',
            background: 'transparent',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
          >
            📄
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-medium" style={{ color: 'var(--fg)' }}>
              {doc.title}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--fg4)' }}>
              {doc.meta}
            </div>
          </div>
          <Pill tone="green">Available</Pill>
        </button>
      ))}
    </div>
  );
}

function MockDocumentList({ docs }: { docs: LoanDocument[] }) {
  return (
    <div>
      {docs.map((doc, idx) => {
        const icon = ICON_COLORS[doc.iconColor];
        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors"
            style={{
              borderBottom: idx < docs.length - 1 ? '1px solid var(--border)' : 'none',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
              style={{ background: icon.bg, color: icon.fg }}
            >
              📄
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium" style={{ color: 'var(--fg)' }}>
                {doc.title}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--fg4)' }}>
                {doc.meta}
              </div>
            </div>
            <Pill tone={doc.statusPill}>{doc.status}</Pill>
          </div>
        );
      })}
    </div>
  );
}

function PdfPreviewModal({
  title,
  url,
  loading,
  onClose,
}: {
  title: string;
  url: string | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(15,23,42,0.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl flex flex-col w-full max-w-[1100px] h-[88vh] overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.32)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="text-[13px] font-semibold flex-1 truncate" style={{ color: 'var(--fg)' }}>
            {title}
          </div>
          {url && (
            <a
              href={url}
              download={`${title}.pdf`}
              className="text-[11.5px] font-semibold hover:underline"
              style={{ color: 'var(--blue)' }}
            >
              Download ↓
            </a>
          )}
          <button
            onClick={onClose}
            className="text-[16px] leading-none px-2 py-0.5 rounded-md"
            style={{
              background: 'var(--elevated)',
              color: 'var(--fg2)',
              border: '1px solid var(--border)',
            }}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
        <div className="flex-1 relative" style={{ background: 'var(--bg)' }}>
          {loading || !url ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--purple)',
                  animation: 'lp-spin 0.8s linear infinite',
                }}
              />
              <div className="text-[12px]" style={{ color: 'var(--fg3)' }}>
                Fetching document…
              </div>
            </div>
          ) : (
            <iframe
              title={title}
              src={url}
              className="w-full h-full"
              style={{ border: 'none', background: 'white' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
