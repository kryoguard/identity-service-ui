"use client"

import { useSearchParams } from "next/navigation";
import VerificationStart from "./components/verification-start";
import VerificationConfirm from "./components/verification-confirm";
import DocumentCapture from "./components/document-capture";

export default function Home() {
  const searchParams = useSearchParams();
  const v = searchParams.get("v");
  return (
    <div>
      {/* <VerificationStart currentSession={v} /> */}
      {/* <VerificationConfirm /> */}
      <DocumentCapture />
    </div>
  );
}
