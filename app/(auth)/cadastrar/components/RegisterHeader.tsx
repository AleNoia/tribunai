import { Scale } from "lucide-react";
import Link from "next/link";

export function RegisterHeader() {
  return (
    <div className="text-center mb-8">
      <Link href="/" className="inline-block mb-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-md">
            <Scale className="h-8 w-8 text-foreground" aria-hidden="true" />
          </div>
          <span className="text-2xl font-semibold">DataJud CNJ</span>
        </div>
      </Link>
      <h1 className="text-2xl font-semibold mt-4">Cadastrar</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Crie sua conta para acessar a plataforma
      </p>
    </div>
  );
}

