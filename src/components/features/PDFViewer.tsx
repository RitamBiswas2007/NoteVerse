import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    url: string;
    zoom: number;
    pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
    onLoadSuccess: (numPages: number) => void;
    onTextExtracted: (text: string) => void;
    onError: (error: Error) => void;
}

export default function PDFViewer({ url, zoom, pageRefs, onLoadSuccess, onTextExtracted, onError }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [isExtracting, setIsExtracting] = useState(false);

    const handleDocumentLoadSuccess = async (pdfProxy: any) => {
        setNumPages(pdfProxy.numPages);
        onLoadSuccess(pdfProxy.numPages);

        // Trigger text extraction
        setIsExtracting(true);
        try {
            // Retrieve the full PDF document to extract text
            // We can use the pdfProxy object directly!
            // pdfProxy is the 'pdf' object from pdfjs.getDocument

            let fullText = "";
            for (let i = 1; i <= pdfProxy.numPages; i++) {
                const page = await pdfProxy.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += `[Page ${i}] ${pageText}\n`;
            }
            onTextExtracted(fullText);
        } catch (err) {
            console.error("Text extraction failed", err);
            onTextExtracted("Error extracting text.");
        } finally {
            setIsExtracting(false);
        }
    };

    const [error, setError] = useState<Error | null>(null);

    const handleError = (err: Error) => {
        console.error("PDF Load Error:", err);
        setError(err);
        onError(err);
    }

    return (
        <Document
            file={url}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleError}
            loading={
                <div className="flex flex-col items-center gap-2 text-zinc-400 mt-20">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
                    <span className="text-xs">Loading Document Engine...</span>
                </div>
            }
            error={
                <div className="flex flex-col items-center gap-4 text-zinc-400 mt-20 bg-zinc-950 p-8 rounded-xl border border-white/5">
                    <span className="text-4xl">⚠️</span>
                    <span className="text-lg font-bold">Cannot render PDF</span>
                    {error && (
                        <div className="max-w-md p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs font-mono break-all">
                            {error.message}
                            {error.name === "MissingPDFException" && <p className="mt-2 text-white">The file is missing or the URL is invalid.</p>}
                            {error.message?.includes("Setting up fake worker failed") && <p className="mt-2 text-white">Worker configuration error.</p>}
                        </div>
                    )}
                </div>
            }
            className="flex flex-col gap-8"
        >
            {Array.from(new Array(numPages), (el, index) => (
                <div
                    key={`page_${index + 1}`}
                    ref={el => pageRefs.current[index] = el}
                    className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white origin-top transition-transform duration-200"
                >
                    <Page
                        pageNumber={index + 1}
                        scale={zoom / 100}
                        className="border border-white/10"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </div>
            ))}
        </Document>
    );
}
