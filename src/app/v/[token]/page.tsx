"use client"

import DocumentCapture from "@/app/components/document-capture";
import { useParams } from "next/navigation";

export default function Home() {
    const params = useParams();
    const token = params?.token as string ?? '' as string;
  return (
    <div>
      <DocumentCapture token={token} />
    </div>
  );
}