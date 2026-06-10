"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";
import { useWizardStore } from "@/stores/useWizardStore";
import { decompressConfig } from "@/lib/sharing";

function WizardLoader() {
  const searchParams = useSearchParams();
  const importConfig = useWizardStore(s => s.importConfig);

  useEffect(() => {
    const c = searchParams.get('c');
    if (c) {
      const config = decompressConfig(c);
      if (config) {
        importConfig(config);
        return;
      }
    }

    const backup = localStorage.getItem('wizard-backup');
    if (backup) {
      try {
        const config = JSON.parse(backup);
        importConfig(config);
        localStorage.removeItem('wizard-backup');
      } catch (e) {
        console.error('Failed to restore wizard backup', e);
      }
    }
  }, [searchParams, importConfig]);

  return <WizardShell />;
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gold">Loading wizard...</div>}>
      <WizardLoader />
    </Suspense>
  );
}
