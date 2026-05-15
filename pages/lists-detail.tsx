import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ListsDetailRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lists");
  }, [router]);

  return null;
}
