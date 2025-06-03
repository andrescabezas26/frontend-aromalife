import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePersonalizationStore } from "@/stores/personalization-store";

export function usePreviewNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { returnToPreview, setReturnToPreview } = usePersonalizationStore();

  const fromPreview = searchParams.get("from") === "preview";

  useEffect(() => {
    if (fromPreview) {
      setReturnToPreview(true);
    }
  }, [fromPreview, setReturnToPreview]);

  const goBackToPreview = () => {
    setReturnToPreview(false);
    router.push("/personalization/preview");
  };

  const handleNext = (defaultNextUrl: string) => {
    if (returnToPreview) {
      goBackToPreview();
    } else {
      router.push(defaultNextUrl);
    }
  };

  return {
    fromPreview: returnToPreview || fromPreview,
    goBackToPreview,
    handleNext,
  };
}
